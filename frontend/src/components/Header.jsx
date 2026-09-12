import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!role) return null;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px var(--space-3)',
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface)',
    }}>
      <Link
        to={role === 'Inspector' ? '/inspector' : '/teacher'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-primary)',
          textDecoration: 'none',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L2 8l10 5 8-4v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 10.5V15c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        VisiTrack
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button type="button" className="secondary" onClick={toggleTheme} style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}>
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}
        </button>
        <button type="button" className="secondary" onClick={handleLogout}>Déconnexion</button>
      </div>
    </header>
  );
}
