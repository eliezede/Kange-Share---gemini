export interface Host {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  phLevels: number[];
  availability: {
    days: string;
    hours: string;
  };
  maintenance: {
    lastFilterChange: string;
    lastECleaning: string;
  };
  isVerified: boolean;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'host';
  timestamp: string;
}

export interface User {
  name: string;
  profilePicture: string;
  preferredCities: string[];
}
