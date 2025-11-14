import { User, Message, Review, WaterRequest } from './types';

const defaultAvailability = {
  'Monday': { enabled: true, startTime: '09:00', endTime: '17:00' },
  'Tuesday': { enabled: true, startTime: '09:00', endTime: '17:00' },
  'Wednesday': { enabled: true, startTime: '09:00', endTime: '17:00' },
  'Thursday': { enabled: true, startTime: '09:00', endTime: '17:00' },
  'Friday': { enabled: true, startTime: '09:00', endTime: '17:00' },
  'Saturday': { enabled: false, startTime: '10:00', endTime: '14:00' },
  'Sunday': { enabled: false, startTime: '10:00', endTime: '14:00' },
};

const MOCK_REVIEWS_SARAH: Review[] = [
    // FIX: Added missing reviewerId property
    { id: 'r1', reviewerId: 'user_mark_456', reviewerName: 'Mark R.', reviewerImage: 'https://picsum.photos/seed/mark/100/100', rating: 5, comment: 'Sarah was incredibly friendly and the pickup process was super smooth. Highly recommend!', date: '2024-07-10' },
    // FIX: Added missing reviewerId property
    { id: 'r2', reviewerId: 'user_emily_789', reviewerName: 'Emily S.', reviewerImage: 'https://picsum.photos/seed/emily/100/100', rating: 5, comment: 'A wonderful host! The water was great and the location is very convenient.', date: '2024-06-28' },
];

const MOCK_REVIEWS_BEN: Review[] = [
    // FIX: Added missing reviewerId property
    { id: 'r3', reviewerId: 'user_david_101', reviewerName: 'David L.', reviewerImage: 'https://picsum.photos/seed/david/100/100', rating: 5, comment: 'Ben is the best! Very accommodating with pickup times. Always a 5-star experience.', date: '2024-07-12' },
    // FIX: Added missing reviewerId property
    { id: 'r4', reviewerId: 'user_jessica_112', reviewerName: 'Jessica P.', reviewerImage: 'https://picsum.photos/seed/jessica/100/100', rating: 5, comment: 'So grateful for Ben\'s availability on the weekend. Made my trip to NYC so much easier.', date: '2024-07-05' },
    // FIX: Added missing reviewerId property
    { id: 'r5', reviewerId: 'user_tom_131', reviewerName: 'Tom H.', reviewerImage: 'https://picsum.photos/seed/tom/100/100', rating: 5, comment: 'Excellent communication and very reliable.', date: '2024-06-22' },
];

// FIX: Changed Host[] to User[] and updated objects to match the User interface.
export let MOCK_HOSTS: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.c@example.com',
    phone: '+1 (555) 001-0001',
    isHost: true,
    rating: 4.9,
    reviews: 12,
    profilePicture: 'https://picsum.photos/seed/sarah/200/200',
    phLevels: [8.5, 9.0, 9.5, 11.5],
    availability: defaultAvailability,
    maintenance: {
      lastFilterChange: '2024-06-15',
      lastECleaning: '2024-07-01',
    },
    isVerified: true,
    address: {
        street: '456 Market St',
        number: '',
        postalCode: '94105',
        city: 'San Francisco',
        country: 'USA',
    },
    followers: ['user_alex_123'],
    following: ['2'],
  },
  {
    id: '2',
    name: 'Ben Miller',
    email: 'ben.m@example.com',
    phone: '+1 (555) 002-0002',
    isHost: true,
    rating: 5.0,
    reviews: 25,
    profilePicture: 'https://picsum.photos/seed/ben/200/200',
    phLevels: [9.5, 11.5],
    availability: {
      ...defaultAvailability,
      'Monday': { enabled: false, startTime: '09:00', endTime: '17:00' },
      'Tuesday': { enabled: false, startTime: '09:00', endTime: '17:00' },
      'Wednesday': { enabled: false, startTime: '09:00', endTime: '17:00' },
      'Thursday': { enabled: false, startTime: '09:00', endTime: '17:00' },
      'Friday': { enabled: false, startTime: '09:00', endTime: '17:00' },
      'Saturday': { enabled: true, startTime: '10:00', endTime: '14:00' },
      'Sunday': { enabled: true, startTime: '10:00', endTime: '14:00' },
    },
    maintenance: {
      lastFilterChange: '2024-07-01',
      lastECleaning: '2024-07-10',
    },
    isVerified: true,
    address: {
        street: '123 Broadway',
        number: 'Suite 200',
        postalCode: '10007',
        city: 'New York',
        country: 'USA',
    },
    followers: ['1'],
    following: [],
  },
  {
    id: '3',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    phone: '+1 (555) 003-0003',
    isHost: true,
    rating: 4.8,
    reviews: 8,
    profilePicture: 'https://picsum.photos/seed/maria/200/200',
    phLevels: [8.5, 9.5],
    availability: {
        'Monday': { enabled: true, startTime: '10:00', endTime: '18:00' },
        'Tuesday': { enabled: true, startTime: '10:00', endTime: '18:00' },
        'Wednesday': { enabled: true, startTime: '10:00', endTime: '18:00' },
        'Thursday': { enabled: true, startTime: '10:00', endTime: '18:00' },
        'Friday': { enabled: true, startTime: '10:00', endTime: '18:00' },
        'Saturday': { enabled: true, startTime: '10:00', endTime: '18:00' },
        'Sunday': { enabled: true, startTime: '10:00', endTime: '18:00' },
    },
    maintenance: {
      lastFilterChange: '2024-05-20',
      lastECleaning: '2024-06-25',
    },
    isVerified: false,
    address: {
        street: '789 Ocean Drive',
        number: '',
        postalCode: '33139',
        city: 'Miami',
        country: 'USA',
    },
    followers: [],
    following: [],
  },
  {
    id: '4',
    name: 'Kenji Tanaka',
    email: 'kenji.t@example.com',
    phone: '+1 (555) 004-0004',
    isHost: true,
    rating: 4.9,
    reviews: 18,
    profilePicture: 'https://picsum.photos/seed/kenji/200/200',
    phLevels: [9.0, 9.5, 11.5],
    availability: {
      ...defaultAvailability,
      'Tuesday': { enabled: false, startTime: '09:00', endTime: '17:00' },
      'Thursday': { enabled: false, startTime: '09:00', endTime: '17:00' },
       'Friday': { enabled: true, startTime: '16:00', endTime: '19:00' },
    },
    maintenance: {
      lastFilterChange: '2024-06-28',
      lastECleaning: '2024-07-05',
    },
    isVerified: true,
    address: {
        street: '101 Hollywood Blvd',
        number: '',
        postalCode: '90028',
        city: 'Los Angeles',
        country: 'USA',
    },
    followers: [],
    following: [],
  },
];

export let MOCK_CURRENT_USER: User = {
  id: 'user_alex_123',
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  phone: '+1 (555) 123-4567',
  profilePicture: 'https://picsum.photos/seed/alex/200/200',
  // FIX: Removed invalid 'preferredCities' property
  isHost: true,
  rating: 4.7,
  reviews: 3,
  phLevels: [9.5, 11.5],
  availability: defaultAvailability,
  maintenance: {
    lastFilterChange: '2024-07-01',
    lastECleaning: '2024-07-15',
  },
  isVerified: false,
  address: {
    street: '123 Wellness Way',
    number: 'Apt 4B',
    postalCode: '94102',
    city: 'San Francisco',
    country: 'USA',
  },
  followers: [],
  following: ['1'],
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

// FIX: Added missing denormalized properties (requesterName, etc.) to all mock requests.
export let MOCK_REQUESTS: WaterRequest[] = [
    // My Requests
    { id: 'req1', requesterId: 'user_alex_123', hostId: '2', status: 'pending', phLevel: 9.5, liters: 5, pickupDate: formatDate(tomorrow), pickupTime: '11:00', notes: 'I will bring two containers.', createdAt: new Date().toISOString(), requesterName: 'Alex Johnson', requesterImage: 'https://picsum.photos/seed/alex/200/200', hostName: 'Ben Miller', hostImage: 'https://picsum.photos/seed/ben/200/200' },
    { id: 'req2', requesterId: 'user_alex_123', hostId: '1', status: 'accepted', phLevel: 11.5, liters: 2, pickupDate: formatDate(today), pickupTime: '14:00', notes: '', createdAt: new Date().toISOString(), requesterName: 'Alex Johnson', requesterImage: 'https://picsum.photos/seed/alex/200/200', hostName: 'Sarah Chen', hostImage: 'https://picsum.photos/seed/sarah/200/200' },
    { id: 'req3', requesterId: 'user_alex_123', hostId: '4', status: 'completed', phLevel: 9.0, liters: 10, pickupDate: formatDate(yesterday), pickupTime: '17:00', notes: 'Quick stop before heading to the airport.', createdAt: new Date().toISOString(), requesterName: 'Alex Johnson', requesterImage: 'https://picsum.photos/seed/alex/200/200', hostName: 'Kenji Tanaka', hostImage: 'https://picsum.photos/seed/kenji/200/200' },
    { id: 'req4', requesterId: 'user_alex_123', hostId: '3', status: 'cancelled', phLevel: 8.5, liters: 5, pickupDate: '2024-07-20', pickupTime: '12:00', notes: '', createdAt: new Date().toISOString(), requesterName: 'Alex Johnson', requesterImage: 'https://picsum.photos/seed/alex/200/200', hostName: 'Maria Garcia', hostImage: 'https://picsum.photos/seed/maria/200/200' },
    
    // Host Dashboard
    { id: 'req5', requesterId: '3', hostId: 'user_alex_123', status: 'pending', phLevel: 9.5, liters: 2, pickupDate: formatDate(tomorrow), pickupTime: '10:00', notes: 'First time user, excited to try!', createdAt: new Date().toISOString(), requesterName: 'Maria Garcia', requesterImage: 'https://picsum.photos/seed/maria/200/200', hostName: 'Alex Johnson', hostImage: 'https://picsum.photos/seed/alex/200/200' },
    { id: 'req6', requesterId: '4', hostId: 'user_alex_123', status: 'accepted', phLevel: 9.5, liters: 5, pickupDate: formatDate(today), pickupTime: '16:00', notes: '', createdAt: new Date().toISOString(), requesterName: 'Kenji Tanaka', requesterImage: 'https://picsum.photos/seed/kenji/200/200', hostName: 'Alex Johnson', hostImage: 'https://picsum.photos/seed/alex/200/200' },
    { id: 'req7', requesterId: '1', hostId: 'user_alex_123', status: 'completed', phLevel: 11.5, liters: 1, pickupDate: formatDate(yesterday), pickupTime: '09:00', notes: 'Just need a little for my morning routine.', createdAt: new Date().toISOString(), requesterName: 'Sarah Chen', requesterImage: 'https://picsum.photos/seed/sarah/200/200', hostName: 'Alex Johnson', hostImage: 'https://picsum.photos/seed/alex/200/200' },
    { id: 'req8', requesterId: '2', hostId: 'user_alex_123', status: 'declined', phLevel: 9.5, liters: 20, pickupDate: formatDate(tomorrow), pickupTime: '18:00', notes: 'Looking to fill up for a road trip.', createdAt: new Date().toISOString(), requesterName: 'Ben Miller', requesterImage: 'https://picsum.photos/seed/ben/200/200', hostName: 'Alex Johnson', hostImage: 'https://picsum.photos/seed/alex/200/200' },
];


// FIX: Corrected types for id, sender, and timestamp to match the Message interface.
export let MOCK_CONVERSATIONS: Record<string, Message[]> = {
    'req2': [
        { id: 'm1', text: 'Hi Sarah, I just submitted a request for 5L of 9.5pH water tomorrow at 2 PM. Is that okay?', sender: 'user_alex_123', timestamp: new Date(Date.now() - 3 * 60000).toISOString() },
        { id: 'm2', text: 'Hi! Yes, that works perfectly. See you tomorrow!', sender: '1', timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
        { id: 'm3', text: 'Great, thanks!', sender: 'user_alex_123', timestamp: new Date(Date.now() - 1 * 60000).toISOString() },
    ]
};
