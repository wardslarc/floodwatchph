import { Routes, Route } from 'react-router-dom';
import Home from './components/home';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;