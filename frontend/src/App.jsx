import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShopStatusProvider } from './context/ShopStatusContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import FloatingActionButtons from './components/FloatingActionButtons';
import LoaderSplashScreen from './components/LoaderSplashScreen';
import SinglePage from './pages/SinglePage';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import HashRedirect from './components/HashRedirect';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useSiteContact } from './utils/siteContact';
import { wakeUpServer } from './utils/api';
import logoImg from './assets/images/logo.png';
import './App.css';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/ctrl-vault-9x');
  const showSiteChrome = !isAdminRoute;
  const showHeader = showSiteChrome;

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const { siteName, logoUrl } = useSiteContact();
  const [splashFinished, setSplashFinished] = useState(false);

  // Wake up Replit backend immediately on app load
  // This runs in background — splash screen covers the wait
  useEffect(() => {
    const wake = async () => {
      const awake = await wakeUpServer();
      if (!awake) {
        console.warn('[App] Server may be slow — retrying in background...');
        // One more attempt after 5 seconds
        setTimeout(() => wakeUpServer(), 5000);
      }
    };
    wake();
  }, []);

  useEffect(() => {
    // Update document title
    if (siteName) {
      document.title = `${siteName}`;
    }

    // Update favicon
    const currentLogoUrl = logoUrl || logoImg;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Create a canvas to add a black background to the favicon
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // Fill black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the logo in the center with some padding
      const padding = 4;
      const size = canvas.width - padding * 2;
      ctx.drawImage(img, padding, padding, size, size);

      link.href = canvas.toDataURL('image/png');
    };
    img.onerror = () => {
      // Fallback if image fails to load due to CORS or other reasons
      link.href = currentLogoUrl;
    };
    img.src = currentLogoUrl;
  }, [siteName, logoUrl]);

  return (
    <>
      {!splashFinished && <LoaderSplashScreen onFinish={() => setSplashFinished(true)} />}
      <div 
        className="app" 
        style={{ 
          opacity: splashFinished ? 1 : 0, 
          transition: 'opacity 0.4s ease-in',
          pointerEvents: splashFinished ? 'auto' : 'none' 
        }}
      >
        {showHeader && <Navbar />}
        {showSiteChrome && <CartDrawer />}
        {showSiteChrome && <FloatingActionButtons />}
        <HashRedirect />
        <main>
          <Routes>
            <Route path="/" element={<SinglePage />} />
            <Route path="/menu" element={<SinglePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/deals" element={<SinglePage />} />
            <Route path="/cart" element={<Cart />} />

            <Route path="/ctrl-vault-9x" element={<AdminLogin />} />
            <Route path="/ctrl-vault-9x/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(211, 47, 47, 0.4)',
              borderRadius: '12px',
              fontFamily: 'var(--font-main, sans-serif)',
            },
            error: {
              iconTheme: {
                primary: '#ff4b4b',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ShopStatusProvider>
          <AppLayout />
        </ShopStatusProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
