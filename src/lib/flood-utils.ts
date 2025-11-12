import { FloodReport, FloodSeverity } from '@/types/flood';

// Mock data for demonstration
export const mockReports: FloodReport[] = [
  {
    id: '1',
    location: {
      lat: 14.5995,
      lng: 120.9842,
      address: 'Quezon City, Metro Manila',
    },
    severity: 'moderate',
    description: 'Knee-deep flooding along Commonwealth Avenue',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&q=80',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    id: '2',
    location: {
      lat: 14.5547,
      lng: 121.0244,
      address: 'Pasig City, Metro Manila',
    },
    severity: 'severe',
    description: 'Waist-deep flooding near Ortigas Center',
    photoUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400&q=80',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
  },
  {
    id: '3',
    location: {
      lat: 14.6507,
      lng: 121.0494,
      address: 'Marikina City, Metro Manila',
    },
    severity: 'light',
    description: 'Ankle-deep water on side streets',
    photoUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

export const getSeverityColor = (severity: FloodSeverity): string => {
  switch (severity) {
    case 'light':
      return '#22c55e'; // green
    case 'moderate':
      return '#eab308'; // yellow
    case 'severe':
      return '#ef4444'; // red
  }
};

export const getSeverityLabel = (severity: FloodSeverity): string => {
  switch (severity) {
    case 'light':
      return 'Light Flooding';
    case 'moderate':
      return 'Moderate Flooding';
    case 'severe':
      return 'Severe Flooding';
  }
};

export const getTimeElapsed = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};
