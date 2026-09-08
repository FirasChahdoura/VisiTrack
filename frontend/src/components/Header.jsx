import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!role) return null;

  return (
    <header>
      <Link to={role === 'Inspector' ? '/inspector' : '/teacher'}>VisiTrack</Link>
      <button type="button" onClick={handleLogout}>Log out</button>
    </header>
  );
}
