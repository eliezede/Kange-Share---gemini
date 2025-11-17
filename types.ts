


export interface Review {
  id: string; // Firestore doc ID
  reviewerId: string;
  reviewerName: string;
  reviewerImage: string;
  rating: number;
  comment: string;
  date: string; // ISO String
}

export interface DistributorProofDocument {
  id: string;
  fileName: string;
  url: string;
  uploadedAt: string; // ISO String
}

export type DistributorVerificationStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'revoked';

// A unified type for all users. Any user can become a host.
export interface User {
  id: string; // Firebase Auth UID
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profilePicture: string; // URL from Firebase Storage
  phone: string;
  bio?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;

  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };

  // Onboarding Status
  onboardingCompleted: boolean;
  onboardingStep: 'welcome' | 'profile' | 'address' | 'distributor-status' | 'summary' | 'completed';
  
  isHost: boolean;
  isAdmin?: boolean;

  // Host-specific fields
  rating: number;
  reviews: number;
  phLevels: number[];
  availability: Record<string, { enabled: boolean; startTime: string; endTime: string; }>;
  maintenance: {
    lastFilterChange: string;
    lastECleaning: string;
  };
  isAcceptingRequests: boolean;

  // New distributor verification fields
  distributorId: string;
  distributorVerificationStatus: DistributorVerificationStatus;
  distributorRejectionReason?: string;
  distributorProofDocuments: DistributorProofDocument[];
  interestedInDistributor: boolean; // for non-distributors
  
  // Social fields
  followers: string[]; // array of user UIDs
  following: string[]; // array of user UIDs

  // Admin and status fields
  isBlocked?: boolean;
  deletedAt?: string; // ISO String for soft delete
  verificationReviewedAt?: string; // ISO String
  verificationReviewedByAdminId?: string; // Admin's UID
}

export interface Message {
  id: string; // Firestore doc ID
  text: string;
  sender: string; // user UID
  timestamp: string; // ISO String
}

export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'declined' | 'chatting';

export interface WaterRequest {
  id: string; // Firestore doc ID
  requesterId: string;
  hostId: string;
  status: RequestStatus;
  phLevel: number;
  liters: number;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  notes: string;
  createdAt: string; // ISO String

  // Denormalized data for easier display
  requesterName: string;
  requesterImage: string;
  hostName: string;
  hostImage: string;
}

export type NotificationType = 'new_request' | 'request_accepted' | 'request_declined' | 'request_cancelled' | 'new_message' | 'new_follower' | 'review_left' | 'distributor_submitted' | 'distributor_approved' | 'distributor_rejected' | 'distributor_revoked' | 'user_blocked' | 'user_unblocked';

export interface Notification {
  id: string;
  type: NotificationType;
  relatedId: string; // ID of the request, chat, or user
  text: string;
  createdAt: string; // ISO String
  read: boolean;
  senderId?: string; // Who triggered the notification
  senderName?: string;
  senderImage?: string;
}