import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, logout, isUnder18User } from '../utils/storage';
import {
  LayoutDashboard,
  CalendarClock,
  HeartPulse,
  MessageSquare,
  Wind,
  BarChart3,
  LifeBuoy,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/planner', label: 'Study Planner', icon: CalendarClock },
  { path: '/stress', label: 'Stress Tracker', icon: HeartPulse },
  { path: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  { path: '/relaxation', label: 'Quick Reset', icon: Wind },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
  { path: '/support', label: 'Support & Safety', icon: LifeBuoy },
];

export default function Navbar() {
  const user = getUser();
  const isUnder18 = isUnder18User(user);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('examease_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="nav-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <nav className={`navbar ${mobileOpen ? 'navbar--open' : ''}`}>
        {/* Brand */}
        <div className="navbar__brand" onClick={() => navigate('/dashboard')}>
          <div className="navbar__logo">
            <GraduationCap size={26} />
          </div>
          <div className="navbar__brand-text">
            <span className="navbar__title">ExamEase</span>
            <span className="navbar__subtitle">AI</span>
          </div>
        </div>

        {/* Theme Switcher in Sidebar */}
        <div className="navbar__theme-wrap">
          <button
            type="button"
            className="navbar__theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={16} className="theme-icon--sun" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={16} className="theme-icon--moon" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="navbar__links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''} ${
                  item.path === '/support' && isUnder18 ? 'navbar__link--highlighted' : ''
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={19} />
              <span>{item.path === '/support' && !isUnder18 ? 'Support' : item.label}</span>
              {item.path === '/support' && isUnder18 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.68rem',
                    background: 'rgba(20, 184, 166, 0.25)',
                    color: 'var(--accent-primary)',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    fontWeight: 600,
                  }}
                >
                  Hub
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* User section */}
        <div className="navbar__footer">
          {user && (
            <div className="navbar__user">
              <div className="navbar__avatar">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="navbar__user-info">
                <span className="navbar__user-name">
                  {user.fullName || 'Student'}
                </span>
                <span className="navbar__user-email">{user.email}</span>
              </div>
            </div>
          )}
          <button className="navbar__logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

