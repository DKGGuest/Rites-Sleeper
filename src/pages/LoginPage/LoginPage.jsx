import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, storeAuthData, isAuthenticated, getStoredUser } from '../../services/authService';
import { ROUTES } from '../../routes';
import './LoginPage.css';

/**
 * Redesigned Login Page Component for Rites-Sleeper
 * Matches the Sarthi landing page UI
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [pointerRatio, setPointerRatio] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isFilled, setIsFilled] = useState({ userId: false, password: false });

  const heroRef = useRef(null);

  const slides = [
    {
      kicker: 'Automated QA Platform',
      title: 'Build quality at source.',
      highlight: 'Deliver safety on track.',
      description: 'Smart checks from material approval to final dispatch with complete digital traceability.',
      image: '/login-assets/WhatsApp Image 2026-02-18 at 5.29.08 PM.jpeg'
    },
    {
      kicker: 'Inspection Intelligence',
      title: 'Catch issues early',
      highlight: 'with real-time inspection.',
      description: 'Drive compliance decisions faster with live alerts, clear records, and accountable workflows.',
      image: '/login-assets/WhatsApp Image 2026-02-18 at 5.29.08 PM (1).jpeg'
    },
    {
      kicker: 'Safety Visibility',
      title: 'One platform for rails',
      highlight: 'clips, sleepers, and pads.',
      description: 'Role-based access and auditable logs keep every quality checkpoint secure and transparent.',
      image: '/login-assets/WhatsApp Image 2026-02-18 at 5.29.08 PM.jpeg'
    }
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [navigate]);

  // Slider Autoplay
  useEffect(() => {
    if (isInteracting) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isInteracting, slides.length]);

  // Scroll Handler for Header Compact State
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePointerMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPointerRatio({ x: Math.max(-0.5, Math.min(0.5, x)), y: Math.max(-0.5, Math.min(0.5, y)) });
  };

  const handlePointerLeave = () => {
    setPointerRatio({ x: 0, y: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('Please enter User ID');
      return;
    }
    if (!password.trim()) {
      setError('Please enter Password');
      return;
    }

    setIsLoading(true);

    try {
      const userData = await loginUser(userId, password);
      storeAuthData(userData);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'userId') {
      setUserId(value);
      setIsFilled({ ...isFilled, userId: value.length > 0 });
    } else if (field === 'password') {
      setPassword(value);
      setIsFilled({ ...isFilled, password: value.length > 0 });
    }
  };

  const parallaxX = pointerRatio.x * 16;
  const scrollShift = Math.max(-16, Math.min(22, -scrollY * 0.08));
  const parallaxY = scrollShift + (pointerRatio.y * 12);

  return (
    <div className="login-redesign-wrapper">
      <header className={`site-header ${scrollY > 8 ? 'is-compact' : ''}`} id="siteHeader">
        <div className="header-shell">
          <a className="brand" href="#home" aria-label="SARTHI home">
            <span className="brand-mark" aria-hidden="true">
              <img className="brand-rites-logo" src="/logo-sarthi.png" alt="SARTHI logo" />
            </span>
            <span className="brand-text">
              <span className="brand-title-row">
                <span className="brand-title">SARTHI</span>
              </span>
              <span className="brand-fullform">System for Automated Review Tracking &amp; Holistic Inspection</span>
            </span>
          </a>
        </div>
      </header>

      <main>
        <section
          className="hero"
          id="home"
          aria-label="SARTHI hero slider"
          ref={heroRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div
            className="hero-slider"
            id="heroSlider"
            aria-live="polite"
            aria-atomic="true"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
          >
            {slides.map((slide, index) => (
              <article
                key={index}
                className={`hero-slide ${index === currentSlide ? 'is-active' : ''}`}
                aria-hidden={index !== currentSlide}
                style={{ zIndex: index === currentSlide ? 2 : 1 }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    '--parallax-x': `${index === currentSlide ? parallaxX : 0}px`,
                    '--parallax-y': `${index === currentSlide ? parallaxY : 0}px`
                  }}
                />
              </article>
            ))}
          </div>

          <div className="hero-overlay" aria-hidden="true"></div>

          <div className="hero-content-shell">
            <div className="hero-grid">
              <article className="hero-copy-card is-revealed reveal-up" id="overview">
                <p className="slide-kicker">{slides[currentSlide].kicker}</p>
                <h1 className="slide-title">
                  {slides[currentSlide].title}
                  <span> {slides[currentSlide].highlight}</span>
                </h1>
                <p className="slide-description">
                  {slides[currentSlide].description}
                </p>
              </article>

              <aside className="dashboard-panel is-revealed" id="dashboardPanel">
                {/* Branding Section */}
                <header className="branding-section">
                  <div className="branding-logo-box">
                    <img className="branding-logo-img" src="/logo-sarthi.png" alt="SARTHI logo" />
                  </div>
                  <h2 className="branding-title">SARTHI</h2>
                  <p className="branding-tagline">System for Automated Review Tracking &amp; Holistic Inspection</p>
                </header>

                <div className="dashboard-login-chip">
                  LOGIN
                </div>

                <form className="dashboard-form" id="loginForm" onSubmit={handleSubmit}>
                  {error && (
                    <div className="login-error-toast">
                      <span>⚠️ {error}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="username">Username or Email</label>
                    <div className="input-field-shell">
                      <span className="input-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.1 0-8 2.1-8 5v1h16v-1c0-2.9-3.9-5-8-5Z"></path>
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        className={isFilled.userId ? 'is-filled' : ''}
                        value={userId}
                        onChange={(e) => handleInputChange('userId', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-field-shell">
                      <span className="input-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                          <path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4Zm2 10.75A1.75 1.75 0 1 1 13.75 16 1.75 1.75 0 0 1 12 17.75Z"></path>
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        className={isFilled.password ? 'is-filled' : ''}
                        value={password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-redesign"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="dashboard-options">
                    <label className="remember-me" htmlFor="rememberMe">
                      <input type="checkbox" id="rememberMe" name="rememberMe" />
                      <span>Remember me</span>
                    </label>
                    <button type="button" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot password?</button>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn js-ripple"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                  <p className="dashboard-footnote">Protected session with activity logging enabled</p>
                </form>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
