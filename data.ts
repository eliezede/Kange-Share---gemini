import { Host, Message, User } from './types';

export const MOCK_HOSTS: Host[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    city: 'San Francisco',
    rating: 4.9,
    reviews: 12,
    image: 'https://picsum.photos/seed/sarah/200/200',
    phLevels: [8.5, 9.0, 9.5, 11.5],
    availability: {
      days: 'Monday - Friday',
      hours: '9:00 AM - 5:00 PM',
    },
    maintenance: {
      lastFilterChange: '2024-06-15',
      lastECleaning: '2024-07-01',
    },
    isVerified: true,
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
      days: 'Weekends Only',
      hours: '10:00 AM - 2:00 PM',
    },
    maintenance: {
      lastFilterChange: '2024-07-01',
      lastECleaning: '2024-07-10',
    },
    isVerified: true,
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
      days: 'All Week',
      hours: 'By appointment',
    },
    maintenance: {
      lastFilterChange: '2024-05-20',
      lastECleaning: '2024-06-25',
    },
    isVerified: false,
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
      days: 'Monday, Wednesday, Friday',
      hours: '4:00 PM - 7:00 PM',
    },
    maintenance: {
      lastFilterChange: '2024-06-28',
      lastECleaning: '2024-07-05',
    },
    isVerified: true,
  },
];

export const MOCK_MESSAGES: Message[] = [
    { id: 1, text: 'Hi Sarah, I just submitted a request for 5L of 9.5pH water tomorrow at 2 PM. Is that okay?', sender: 'user', timestamp: '10:30 AM' },
    { id: 2, text: 'Hi! Yes, that works perfectly. See you tomorrow!', sender: 'host', timestamp: '10:32 AM' },
    { id: 3, text: 'Great, thanks!', sender: 'user', timestamp: '10:33 AM' },
];

export const MOCK_USER: User = {
  name: 'Alex Johnson',
  profilePicture: 'https://picsum.photos/seed/alex/200/200',
  preferredCities: ['San Francisco', 'Tokyo', 'Bali'],
};
