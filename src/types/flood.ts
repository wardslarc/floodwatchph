export type FloodSeverity = 'light' | 'moderate' | 'severe';

export interface FloodReport {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: FloodSeverity;
  description?: string;
  photoUrl?: string;
  timestamp: Date;
  reportedBy?: string;
}

export interface MapFilters {
  severity: FloodSeverity[];
  timeRange: '1h' | '6h' | '24h' | '48h' | 'all';
}
