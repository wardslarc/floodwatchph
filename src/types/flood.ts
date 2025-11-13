// types/flood.ts
export interface FloodReport {
  _id?: string;
  id?: string;
  severity: 'light' | 'moderate' | 'severe';
  location: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  reportedBy?: string;
  status: 'active' | 'resolved' | 'false_report';
  verified?: boolean;
  createdAt?: Date | string;
  timestamp?: Date | string; // For backward compatibility
  updatedAt?: Date | string;
}