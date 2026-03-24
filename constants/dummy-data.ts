export type RideType = {
  id: string;
  name: string;
  description: string;
  eta: string;
  price: number;
  image: string;
};

export type Driver = {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
  avatar: string;
};

export type HistoryTrip = {
  id: string;
  date: string;
  from: string;
  to: string;
  price: number;
  distance: string;
  duration: string;
};

export type PlaceOption = {
  id: string;
  label: string;
  coords: {
    latitude: number;
    longitude: number;
  };
};

export type DriverMatchRequest = {
  id: string;
  passengerName: string;
  passengerRating: number;
  pickup: string;
  destination: string;
  distanceKm: number;
  etaMin: number;
  estimatedFare: number;
  note: string;
};

export const homeRideOptions = [
  { id: 'eco-car', icon: 'car-outline', label: 'Eco Car', estimate: '$5.80' },
  { id: 'sedan', icon: 'car-sport', label: 'Sedan', estimate: '$8.10' },
  { id: 'suv', icon: 'car', label: 'SUV', estimate: '$11.50' },
] as const;

export const rideTypes: RideType[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable everyday rides',
    eta: '3 min',
    price: 6.5,
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Comfort with top-rated drivers',
    eta: '5 min',
    price: 10.2,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'suv',
    name: 'SUV',
    description: 'Extra space for family or luggage',
    eta: '6 min',
    price: 12.4,
    image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=400&q=80',
  },
];

export const sampleDriver: Driver = {
  id: 'driver-1',
  name: 'Daniel Tran',
  rating: 4.9,
  vehicle: 'Toyota Vios - Silver',
  plate: '59A-123.45',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
};

export const historyTrips: HistoryTrip[] = [
  {
    id: 't1',
    date: '24 Mar 2026, 08:40',
    from: 'Ben Thanh Market',
    to: 'Saigon Centre',
    price: 6.5,
    distance: '3.8 km',
    duration: '12 min',
  },
  {
    id: 't2',
    date: '23 Mar 2026, 19:15',
    from: 'District 7',
    to: 'Airport T1',
    price: 10.2,
    distance: '10.1 km',
    duration: '28 min',
  },
  {
    id: 't3',
    date: '22 Mar 2026, 14:05',
    from: 'Landmark 81',
    to: 'Thao Dien',
    price: 12.4,
    distance: '8.9 km',
    duration: '24 min',
  },
];

export const placeOptions: PlaceOption[] = [
  {
    id: 'p1',
    label: 'Ben Thanh Market',
    coords: { latitude: 10.7724, longitude: 106.6981 },
  },
  {
    id: 'p2',
    label: 'Saigon Centre',
    coords: { latitude: 10.7741, longitude: 106.7002 },
  },
  {
    id: 'p3',
    label: 'Bitexco Tower',
    coords: { latitude: 10.7716, longitude: 106.7047 },
  },
  {
    id: 'p4',
    label: 'Tan Son Nhat Airport T1',
    coords: { latitude: 10.8188, longitude: 106.652 },
  },
  {
    id: 'p5',
    label: 'Landmark 81',
    coords: { latitude: 10.7947, longitude: 106.7219 },
  },
  {
    id: 'p6',
    label: 'Thao Dien',
    coords: { latitude: 10.8014, longitude: 106.7318 },
  },
  {
    id: 'p7',
    label: 'District 7 Crescent Mall',
    coords: { latitude: 10.7297, longitude: 106.7212 },
  },
  {
    id: 'p8',
    label: 'Pham Ngu Lao Street',
    coords: { latitude: 10.7675, longitude: 106.6934 },
  },
];

export const sampleDriverRequest: DriverMatchRequest = {
  id: 'req-401',
  passengerName: 'Linh Nguyen',
  passengerRating: 4.8,
  pickup: 'Ben Thanh Market',
  destination: 'Tan Son Nhat Airport T1',
  distanceKm: 9.6,
  etaMin: 24,
  estimatedFare: 12.8,
  note: 'Passenger has 1 medium suitcase',
};
