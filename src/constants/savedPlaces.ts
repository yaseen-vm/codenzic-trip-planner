export type SavedPlace = {
  id: string;
  name: string;
  address: string;
  // Short form used in route summaries, e.g. "Home · Villa 12, Street 840".
  short: string;
  icon: 'home' | 'building' | 'ferry' | 'train' | 'plane';
  latitude: number;
  longitude: number;
};

// Sample places from the design; coordinates are approximate.
export const SAVED_PLACES: SavedPlace[] = [
  {
    id: 'home',
    name: 'Home',
    address: 'Villa 12, Street 840, Zone 61 · West Bay',
    short: 'Villa 12, Street 840',
    icon: 'home',
    latitude: 25.3231,
    longitude: 51.5284,
  },
  {
    id: 'marina-office',
    name: 'Marina Office Tower',
    address: 'Level 14, Al Fardan Rd · Lusail Marina',
    short: 'Level 14, Al Fardan Rd',
    icon: 'building',
    latitude: 25.4195,
    longitude: 51.5455,
  },
  {
    id: 'corniche-ferry',
    name: 'Corniche Ferry Terminal',
    address: 'Gate 3, Corniche Promenade',
    short: 'Gate 3, Corniche Promenade',
    icon: 'ferry',
    latitude: 25.2955,
    longitude: 51.5282,
  },
  {
    id: 'msheireb-metro',
    name: 'Msheireb Metro Station',
    address: 'Al Kinana St · Msheireb Downtown',
    short: 'Al Kinana St',
    icon: 'train',
    latitude: 25.2866,
    longitude: 51.5265,
  },
  {
    id: 'hamad-airport',
    name: 'Hamad International Airport',
    address: 'Terminal 1, Departures',
    short: 'Terminal 1, Departures',
    icon: 'plane',
    latitude: 25.2731,
    longitude: 51.6081,
  },
];
