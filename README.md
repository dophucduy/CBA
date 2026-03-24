# CBA

Expo app for the customer, driver, and admin MVP.

## Run the app

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the live matching backend in one terminal

   ```bash
   npm run server:matching
   ```

3. Start Expo in a second terminal

   ```bash
   npm run start
   ```

The matching API listens on `http://localhost:3001` by default and persists ride requests in `backend/data/live-ride-requests.json`.

## Override the matching API URL

Set `EXPO_PUBLIC_MATCHING_API_BASE_URL` if your Expo app needs to reach a different host.

Example:

```bash
EXPO_PUBLIC_MATCHING_API_BASE_URL=http://192.168.1.10:3001 npm run start
```
