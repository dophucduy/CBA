const { createServer } = require('node:http');
const { mkdirSync, existsSync, readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const PORT = Number.parseInt(process.env.MATCHING_API_PORT ?? '3001', 10);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'live-ride-requests.json');

function ensureDataFile() {
  mkdirSync(DATA_DIR, { recursive: true });

  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, '[]\n', 'utf8');
  }
}

function readRideRequests() {
  ensureDataFile();

  try {
    const raw = readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRideRequests(requests) {
  ensureDataFile();
  writeFileSync(DATA_FILE, `${JSON.stringify(requests, null, 2)}\n`, 'utf8');
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function sendNoContent(response) {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  response.end();
}

function parseNumberPrefix(value) {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getWaitingRideRequests(requests) {
  return requests.filter((request) => request.status === 'waiting');
}

function upsertCustomerRideRequest(requests, input) {
  const existingRequest = requests.find((request) => request.bookingId === input.bookingId);
  const now = new Date().toISOString();

  const nextRequest = {
    id: existingRequest?.id ?? `ride-request-${input.bookingId}`,
    bookingId: input.bookingId,
    customerAccountId: input.customerAccountId,
    passengerName: input.passengerName,
    passengerRating: existingRequest?.passengerRating ?? 4.8,
    pickup: input.pickup,
    destination: input.destination,
    distanceKm: parseNumberPrefix(input.distanceText),
    etaMin: parseNumberPrefix(input.etaText),
    estimatedFare: Number(input.estimatedFare ?? 0),
    rideName: input.rideName,
    distanceText: input.distanceText,
    etaText: input.etaText,
    note: input.note ?? `${input.rideName} booking is waiting for a nearby driver.`,
    status: existingRequest?.status ?? 'waiting',
    driverAccountId: existingRequest?.driverAccountId ?? null,
    driverName: existingRequest?.driverName ?? null,
    createdAt: existingRequest?.createdAt ?? now,
    updatedAt: now,
  };

  return [nextRequest, ...requests.filter((request) => request.id !== nextRequest.id)];
}

function claimNextWaitingRideRequest(requests, driver) {
  const currentAssignment =
    requests.find(
      (request) =>
        request.driverAccountId === driver.accountId &&
        (request.status === 'claimed' || request.status === 'accepted')
    ) ?? null;

  if (currentAssignment) {
    return {
      requests,
      request: currentAssignment,
    };
  }

  const nextWaiting = requests.find((request) => request.status === 'waiting');

  if (!nextWaiting) {
    return {
      requests,
      request: null,
    };
  }

  const claimedRequest = {
    ...nextWaiting,
    status: 'claimed',
    driverAccountId: driver.accountId,
    driverName: driver.name,
    updatedAt: new Date().toISOString(),
  };

  return {
    requests: [claimedRequest, ...requests.filter((request) => request.id !== claimedRequest.id)],
    request: claimedRequest,
  };
}

function releaseRideRequest(requests, requestId) {
  const targetRequest = requests.find((request) => request.id === requestId);

  if (!targetRequest) {
    return {
      requests,
      request: null,
    };
  }

  const releasedRequest = {
    ...targetRequest,
    status: 'waiting',
    driverAccountId: null,
    driverName: null,
    updatedAt: new Date().toISOString(),
  };

  return {
    requests: [releasedRequest, ...requests.filter((request) => request.id !== releasedRequest.id)],
    request: releasedRequest,
  };
}

function acceptRideRequest(requests, requestId, driver) {
  const targetRequest = requests.find((request) => request.id === requestId);

  if (!targetRequest) {
    return {
      requests,
      request: null,
    };
  }

  const acceptedRequest = {
    ...targetRequest,
    status: 'accepted',
    driverAccountId: driver.accountId,
    driverName: driver.name,
    updatedAt: new Date().toISOString(),
  };

  return {
    requests: [acceptedRequest, ...requests.filter((request) => request.id !== acceptedRequest.id)],
    request: acceptedRequest,
  };
}

function completeRideRequest(requests, requestId) {
  const targetRequest = requests.find((request) => request.id === requestId);

  if (!targetRequest) {
    return {
      requests,
      request: null,
    };
  }

  const completedRequest = {
    ...targetRequest,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  };

  return {
    requests: [completedRequest, ...requests.filter((request) => request.id !== completedRequest.id)],
    request: completedRequest,
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = '';

    request.on('data', (chunk) => {
      rawBody += chunk;
    });

    request.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function requireString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) {
    sendJson(response, 400, { message: 'Invalid request.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    sendNoContent(response);
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
  const pathname = url.pathname;

  if (request.method === 'GET' && pathname === '/health') {
    sendJson(response, 200, { ok: true, service: 'matching-api' });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/live-ride-requests') {
    const requests = readRideRequests();
    const status = url.searchParams.get('status');
    const payload = status ? requests.filter((requestItem) => requestItem.status === status) : requests;
    sendJson(response, 200, payload);
    return;
  }

  if (request.method === 'GET' && pathname.startsWith('/api/live-ride-requests/by-booking/')) {
    const bookingId = decodeURIComponent(pathname.replace('/api/live-ride-requests/by-booking/', ''));
    const requestItem = readRideRequests().find((item) => item.bookingId === bookingId) ?? null;
    sendJson(response, 200, requestItem);
    return;
  }

  if (request.method === 'GET' && pathname.startsWith('/api/live-ride-requests/')) {
    const requestId = decodeURIComponent(pathname.replace('/api/live-ride-requests/', ''));
    const requestItem = readRideRequests().find((item) => item.id === requestId) ?? null;
    sendJson(response, 200, requestItem);
    return;
  }

  try {
    if (request.method === 'POST' && pathname === '/api/live-ride-requests/upsert-customer') {
      const body = await readJsonBody(request);

      if (
        !requireString(body.bookingId) ||
        !requireString(body.customerAccountId) ||
        !requireString(body.passengerName) ||
        !requireString(body.pickup) ||
        !requireString(body.destination) ||
        !requireString(body.rideName) ||
        !requireString(body.distanceText) ||
        !requireString(body.etaText)
      ) {
        sendJson(response, 400, { message: 'Missing required ride request fields.' });
        return;
      }

      const nextRequests = upsertCustomerRideRequest(readRideRequests(), body);
      writeRideRequests(nextRequests);
      const requestItem = nextRequests.find((item) => item.bookingId === body.bookingId) ?? null;
      sendJson(response, 200, requestItem);
      return;
    }

    if (request.method === 'POST' && pathname === '/api/live-ride-requests/claim-next') {
      const body = await readJsonBody(request);

      if (!requireString(body.accountId) || !requireString(body.name)) {
        sendJson(response, 400, { message: 'Driver accountId and name are required.' });
        return;
      }

      const result = claimNextWaitingRideRequest(readRideRequests(), body);
      writeRideRequests(result.requests);
      sendJson(response, 200, result.request);
      return;
    }

    if (request.method === 'POST' && pathname.endsWith('/release')) {
      const requestId = decodeURIComponent(pathname.replace('/api/live-ride-requests/', '').replace('/release', ''));
      const result = releaseRideRequest(readRideRequests(), requestId);
      writeRideRequests(result.requests);
      sendJson(response, 200, result.request);
      return;
    }

    if (request.method === 'POST' && pathname.endsWith('/accept')) {
      const requestId = decodeURIComponent(pathname.replace('/api/live-ride-requests/', '').replace('/accept', ''));
      const body = await readJsonBody(request);

      if (!requireString(body.accountId) || !requireString(body.name)) {
        sendJson(response, 400, { message: 'Driver accountId and name are required.' });
        return;
      }

      const result = acceptRideRequest(readRideRequests(), requestId, body);
      writeRideRequests(result.requests);
      sendJson(response, 200, result.request);
      return;
    }

    if (request.method === 'POST' && pathname.endsWith('/complete')) {
      const requestId = decodeURIComponent(pathname.replace('/api/live-ride-requests/', '').replace('/complete', ''));
      const result = completeRideRequest(readRideRequests(), requestId);
      writeRideRequests(result.requests);
      sendJson(response, 200, result.request);
      return;
    }
  } catch {
    sendJson(response, 400, { message: 'Invalid JSON request body.' });
    return;
  }

  sendJson(response, 404, { message: 'Route not found.' });
});

server.listen(PORT, () => {
  ensureDataFile();
  console.log(`Matching API listening on http://localhost:${PORT}`);
});
