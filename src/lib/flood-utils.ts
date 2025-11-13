// lib/flood-utils.ts

// Existing functions
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'light': return '#fbbf24'; // yellow
    case 'moderate': return '#f97316'; // orange
    case 'severe': return '#dc2626'; // red
    default: return '#6b7280'; // gray
  }
};

export const getSeverityLabel = (severity: string): string => {
  switch (severity) {
    case 'light': return 'Light';
    case 'moderate': return 'Moderate';
    case 'severe': return 'Severe';
    default: return 'Unknown';
  }
};

// Time elapsed function
export const getTimeElapsed = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

// Empty array for mockReports (no demo data)
export const mockReports: any[] = [];