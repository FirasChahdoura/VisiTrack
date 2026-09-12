export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-3)',
      gap: 'var(--space-3)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '24px',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: 'var(--color-primary)',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L2 8l10 5 8-4v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 10.5V15c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        VisiTrack
      </div>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        {children}
      </div>
    </div>
  );
}
