import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FloodSeverity } from '@/types/flood';
import { MapPin, Camera, Loader2 } from 'lucide-react';
import { getSeverityColor, getSeverityLabel } from '@/lib/flood-utils';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (report: any) => void;
}

export default function ReportModal({ open, onOpenChange, onSubmit }: ReportModalProps) {
  const [severity, setSeverity] = useState<FloodSeverity>('moderate');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding (simplified - in production use a proper API)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation(data.display_name || `${latitude}, ${longitude}`);
          } catch (error) {
            setLocation(`${latitude}, ${longitude}`);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      alert('Please provide a location');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReport = {
        severity,
        location,
        description,
        photo: photoPreview,
        timestamp: new Date(),
      };
      
      onSubmit?.(newReport);
      setIsSubmitting(false);
      
      // Reset form
      setSeverity('moderate');
      setLocation('');
      setDescription('');
      setPhoto(null);
      setPhotoPreview(null);
      
      onOpenChange(false);
    }, 1000);
  };

  const severityOptions: FloodSeverity[] = ['light', 'moderate', 'severe'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Report Flood</DialogTitle>
          <DialogDescription>
            Help your community by reporting flood conditions in your area
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
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
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
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${severity === option ? 'ring-2 ring-offset-2' : 'hover:border-gray-400'}
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
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            <div className="space-y-3">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload photo
                    </span>
                  </div>
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
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
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}