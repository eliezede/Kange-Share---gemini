import { Host, Message, User, Review, WaterRequest } from './types';

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
    { id: 'r1', reviewerName: 'Mark R.', reviewerImage: 'https://picsum.photos/seed/mark/100/100', rating: 5, comment: 'Sarah was incredibly friendly and the pickup process was super smooth. Highly recommend!', date: '2024-07-10' },
    { id: 'r2', reviewerName: 'Emily S.', reviewerImage: 'https://picsum.photos/seed/emily/100/100', rating: 5, comment: 'A wonderful host! The water was great and the location is very convenient.', date: '2024-06-28' },
];

const MOCK_REVIEWS_BEN: Review[] = [
    { id: 'r3', reviewerName: 'David L.', reviewerImage: 'https://picsum.photos/seed/david/100/100', rating: 5, comment: 'Ben is the best! Very accommodating with pickup times. Always a 5-star experience.', date: '2024-07-12' },
    { id: 'r4', reviewerName: 'Jessica P.', reviewerImage: 'https://picsum.photos/seed/jessica/100/100', rating: 5, comment: 'So grateful for Ben\'s availability on the weekend. Made my trip to NYC so much easier.', date: '2024-07-05' },
    { id: 'r5', reviewerName: 'Tom H.', reviewerImage: 'https://picsum.photos/seed/tom/100/100', rating: 5, comment: 'Excellent communication and very reliable.', date: '2024-06-22' },
];

export let MOCK_HOSTS: Host[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    city: 'San Francisco',
    rating: 4.9,
    reviews: 12,
    image: 'https://picsum.photos/seed/sarah/200/200',
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
    fullReviews: MOCK_REVIEWS_SARAH,
    followers: ['user_alex_123'],
    following: ['2'],
  },
  {
    id: '2',
    name: 'Ben Miller',
    city: 'New York',
    rating: 5.0,
    reviews: 25,
    image: 'https://picsum.photos/seed/ben/200/200',
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
    fullReviews: MOCK_REVIEWS_BEN,
    followers: ['1'],
    following: [],
  },
  {
    id: '3',
    name: 'Maria Garcia',
    city: 'Miami',
    rating: 4.8,
    reviews: 8,
    image: 'https://picsum.photos/seed/maria/200/200',
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
    fullReviews: [],
    followers: [],
    following: [],
  },
  {
    id: '4',
    name: 'Kenji Tanaka',
    city: 'Los Angeles',
    rating: 4.9,
    reviews: 18,
    image: 'https://picsum.photos/seed/kenji/200/200',
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
    fullReviews: [
        { id: 'r6', reviewerName: 'Chloe K.', reviewerImage: 'https://picsum.photos/seed/chloe/100/100', rating: 5, comment: 'Kenji is a fantastic host!', date: '2024-07-15' },
    ],
    followers: [],
    following: [],
  },
];

export let MOCK_CURRENT_USER: User = {
  id: 'user_alex_123',
  name: 'Alex Johnson',
  phone: '+1 (555) 123-4567',
  profilePicture: 'https://picsum.photos/seed/alex/200/200',
  preferredCities: ['San Francisco', 'Tokyo', 'Bali'],
  phLevels: [9.5, 11.5],
  availability: defaultAvailability,
  maintenance: {
    lastFilterChange: '2024-07-01',
    lastECleaning: '2024-07-15',
  },
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

export let MOCK_REQUESTS: WaterRequest[] = [
    // My Requests
    { id: 'req1', requesterId: 'user_alex_123', hostId: '2', status: 'pending', phLevel: 9.5, liters: 5, pickupDate: formatDate(tomorrow), pickupTime: '11:00', notes: 'I will bring two containers.', createdAt: new Date().toISOString() },
    { id: 'req2', requesterId: 'user_alex_123', hostId: '1', status: 'accepted', phLevel: 11.5, liters: 2, pickupDate: formatDate(today), pickupTime: '14:00', notes: '', createdAt: new Date().toISOString() },
    { id: 'req3', requesterId: 'user_alex_123', hostId: '4', status: 'completed', phLevel: 9.0, liters: 10, pickupDate: formatDate(yesterday), pickupTime: '17:00', notes: 'Quick stop before heading to the airport.', createdAt: new Date().toISOString() },
    { id: 'req4', requesterId: 'user_alex_123', hostId: '3', status: 'cancelled', phLevel: 8.5, liters: 5, pickupDate: '2024-07-20', pickupTime: '12:00', notes: '', createdAt: new Date().toISOString() },
    
    // Host Dashboard
    { id: 'req5', requesterId: '3', hostId: 'user_alex_123', status: 'pending', phLevel: 9.5, liters: 2, pickupDate: formatDate(tomorrow), pickupTime: '10:00', notes: 'First time user, excited to try!', createdAt: new Date().toISOString() },
    { id: 'req6', requesterId: '4', hostId: 'user_alex_123', status: 'accepted', phLevel: 9.5, liters: 5, pickupDate: formatDate(today), pickupTime: '16:00', notes: '', createdAt: new Date().toISOString() },
    { id: 'req7', requesterId: '1', hostId: 'user_alex_123', status: 'completed', phLevel: 11.5, liters: 1, pickupDate: formatDate(yesterday), pickupTime: '09:00', notes: 'Just need a little for my morning routine.', createdAt: new Date().toISOString() },
    { id: 'req8', requesterId: '2', hostId: 'user_alex_123', status: 'declined', phLevel: 9.5, liters: 20, pickupDate: formatDate(tomorrow), pickupTime: '18:00', notes: 'Looking to fill up for a road trip.', createdAt: new Date().toISOString() },
];


export let MOCK_CONVERSATIONS: Record<string, Message[]> = {
    'req2': [
        { id: 1, text: 'Hi Sarah, I just submitted a request for 5L of 9.5pH water tomorrow at 2 PM. Is that okay?', sender: 'user', timestamp: '10:30 AM' },
        { id: 2, text: 'Hi! Yes, that works perfectly. See you tomorrow!', sender: 'host', timestamp: '10:32 AM' },
        { id: 3, text: 'Great, thanks!', sender: 'user', timestamp: '10:33 AM' },
    ]
};
