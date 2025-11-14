export interface Review {
  id: string;
  reviewerName: string;
  reviewerImage: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Host {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  phLevels: number[];
  availability: Record<string, { enabled: boolean; startTime: string; endTime: string; }>;
  maintenance: {
    lastFilterChange: string;
    lastECleaning: string;
  };
  isVerified: boolean;
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };
  fullReviews: Review[];
  followers: string[];
  following: string[];
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'host';
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  profilePicture: string;
  preferredCities: string[];
  phLevels: number[];
  availability: Record<string, { enabled: boolean; startTime: string; endTime: string; }>;
  maintenance: {
    lastFilterChange: string;
    lastECleaning: string;
  };
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };
  followers: string[];
  following: string[];
}

export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'declined' | 'chatting';

export interface WaterRequest {
  id: string;
  requesterId: string;
  hostId: string;
  status: RequestStatus;
  phLevel: number;
  liters: number;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  notes: string;
  createdAt: string; // ISO String
}