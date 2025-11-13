import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplet, MapPin, AlertTriangle, Users, Clock, LogOut, UserCircle, Info } from 'lucide-react';
import FloodMap from './FloodMap';
import ReportModal from './ReportModal';
import AuthModal from './AuthModal';
import { mockReports } from '@/lib/flood-utils';
import { FloodReport } from '@/types/flood';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [reports, setReports] = useState<FloodReport[]>(mockReports);
  const { user, isAuthenticated, logout } = useAuth();

  const handleSubmitReport = (newReport: any) => {
    if (!isAuthenticated) {
      setShowReportModal(false);
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }
    console.log('New report submitted:', newReport);
    alert('Report submitted successfully! Thank you for helping the community.');
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setShowAuthModal(true);
    } else {
      setShowReportModal(true);
    }
  };

  if (showMap) {
    return (
      <div className="h-screen w-full flex flex-col bg-background">
        {/* Header */}
        <header className="bg-white border-b shadow-sm z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-blue-600">FloodWatch.ph</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={handleReportClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Flood
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMap(false)}
              >
                Back to Home
              </Button>
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserCircle className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Map */}
        <div className="flex-1">
          <FloodMap reports={reports} />
        </div>

        <ReportModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          onSubmit={handleSubmitReport}
        />
        
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          defaultTab={authModalTab}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-600">FloodWatch.ph</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReportClick}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Flood
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => {
                  setAuthModalTab('login');
                  setShowAuthModal(true);
                }}
              >
                <UserCircle className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Real-Time Community Flood Reports
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Stay informed about flood conditions across the Philippines. 
            View real-time reports from your community and help others stay safe.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowMap(true)}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            >
              <MapPin className="mr-2 h-5 w-5" />
              View Flood Map
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleReportClick}
              className="text-lg px-8 py-6"
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              Submit Report
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {reports.length}
            </h3>
            <p className="text-gray-600">Active Reports</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Nationwide
            </h3>
            <p className="text-gray-600">Coverage</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Community
            </h3>
            <p className="text-gray-600">Driven Platform</p>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Reports</h3>
          
          {reports.length === 0 ? (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>No flood reports yet.</strong> Be the first to report a flood situation in your area and help your community stay safe.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                {reports.slice(0, 3).map((report) => (
                  <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      {report.photo && (
                        <img
                          src={report.photo}
                          alt="Flood report"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{report.location}</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Recent'}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`
                              ${report.severity === 'light' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                              ${report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : ''}
                              ${report.severity === 'severe' ? 'bg-red-100 text-red-700 border-red-300' : ''}
                            `}
                          >
                            {report.severity ? report.severity.charAt(0).toUpperCase() + report.severity.slice(1) : 'Unknown'}
                          </Badge>
                        </div>
                        {report.description && (
                          <p className="text-gray-600">{report.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowMap(true)}
                >
                  View All Reports on Map
                </Button>
              </div>
            </>
          )}
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="font-semibold text-lg mb-2">Report</h4>
              <p className="text-gray-600">
                Submit flood reports with location, severity, and description
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="font-semibold text-lg mb-2">View</h4>
              <p className="text-gray-600">
                Check real-time flood conditions on the interactive map
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="font-semibold text-lg mb-2">Stay Safe</h4>
              <p className="text-gray-600">
                Make informed decisions about travel and safety
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplet className="h-6 w-6" />
            <span className="text-xl font-bold">FloodWatch.ph</span>
          </div>
          <p className="text-gray-400">
            Community-driven flood reporting for the Philippines
          </p>
          <p className="text-gray-500 text-sm mt-4">
            © 2024 FloodWatch.ph. Helping communities stay safe.
          </p>
        </div>
      </footer>

      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        onSubmit={handleSubmitReport}
      />
      
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab={authModalTab}
      />
    </div>
  );
}