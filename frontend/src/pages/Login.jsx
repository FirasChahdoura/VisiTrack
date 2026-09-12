import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await client.post('/auth/login', { email, password });
      const { token } = response.data;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      login(token);
      navigate(role === 'Inspector' ? '/inspector' : '/teacher');
    } catch (err) {
      setError(err.response?.data?.message === 'Invalid email or password.'
        ? 'Email ou mot de passe incorrect.'
        : err.response?.data?.message || 'Échec de la connexion.');
    }
  };

  return (
    <AuthLayout>
      <h1>Se connecter</h1>
      {error && (
        <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-2)', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div>
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: 'var(--space-1)' }}>Se connecter</button>
      </form>
      <p style={{ marginTop: 'var(--space-3)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
        Vous n'avez pas de compte ? <Link to="/register">Inscrivez-vous ici</Link>
      </p>
    </AuthLayout>
  );
}
