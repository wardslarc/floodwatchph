import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FloodSeverity } from '@/types/flood';
import { MapPin, Loader2 } from 'lucide-react';
import { getSeverityColor, getSeverityLabel } from '@/lib/flood-utils';
import { useAuth } from '@/contexts/AuthContext'; // Import your auth context

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (report: any) => void;
}

export default function ReportModal({ open, onOpenChange, onSubmit }: ReportModalProps) {
  const { user, isAuthenticated } = useAuth(); // Get auth state
  const [severity, setSeverity] = useState<FloodSeverity>('moderate');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentCoords({ latitude, longitude });
          
          // Use reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          } catch (error) {
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
          
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!location) {
    alert('Please provide a location');
    return;
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    alert('Please log in to submit a flood report');
    return;
  }

  setIsSubmitting(true);
  
  try {
    // Get the authentication token
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    // Prepare the data for API submission
    const reportData = {
      severity,
      location,
      description,
      latitude: currentCoords?.latitude,
      longitude: currentCoords?.longitude,
    };

    // Make API call to your backend with authentication
    const response = await fetch('http://localhost:5000/api/flood-reports/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit report');
    }

    // Call the onSubmit callback if provided
    onSubmit?.(result.data);

    // Reset form
    resetForm();
    
    // Show success message
    alert('Report submitted successfully! Thank you for helping your community.');
    
    onOpenChange(false);
    
  } catch (error) {
    console.error('Error submitting report:', error);
    
    if (error.message.includes('Authentication token not found') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('Access denied')) {
      alert('Your session has expired. Please log in again to submit a report.');
    } else {
      alert(error.message || 'Failed to submit report. Please try again.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const resetForm = () => {
    setSeverity('moderate');
    setLocation('');
    setDescription('');
    setCurrentCoords(null);
  };

  const severityOptions: FloodSeverity[] = ['light', 'moderate', 'severe'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Report Flood</DialogTitle>
          <DialogDescription>
            {isAuthenticated ? (
              'Help your community by reporting flood conditions in your area'
            ) : (
              <span className="text-orange-600">
                Please log in to submit flood reports
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Enter location or use GPS"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
                required
                disabled={!isAuthenticated}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGetLocation}
                disabled={isGettingLocation || !isAuthenticated}
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <Label>Flood Severity *</Label>
            <div className="grid grid-cols-3 gap-3">
              {severityOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSeverity(option)}
                  disabled={!isAuthenticated}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${severity === option ? 'ring-2 ring-offset-2' : 'hover:border-gray-400'}
                    ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{
                    borderColor: severity === option ? getSeverityColor(option) : '#e5e7eb',
                    ...(severity === option && {
                      '--tw-ring-color': getSeverityColor(option),
                    } as React.CSSProperties),
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: getSeverityColor(option) }}
                  />
                  <p className="text-sm font-medium text-center">
                    {getSeverityLabel(option)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the flood situation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={!isAuthenticated}
            />
          </div>

          {/* User Info Display */}
          {isAuthenticated && user && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Submitting as: <strong>{user.name}</strong> ({user.email})
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !location || !isAuthenticated}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : !isAuthenticated ? (
                'Login Required'
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>

          {/* Login Prompt */}
          {!isAuthenticated && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 text-center">
                You need to be logged in to submit flood reports. 
                Please log in or create an account to help your community.
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}