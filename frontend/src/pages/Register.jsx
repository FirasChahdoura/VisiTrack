import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', schoolId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    client.get('/schools').then((response) => setSchools(response.data));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/auth/register', { ...formData, schoolId: Number(formData.schoolId) });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg === 'Email already registered.' ? 'Cet e-mail est déjà enregistré.' :
        msg === 'Invalid school selected.' ? 'École invalide.' :
        msg || 'Échec de l\'inscription.'
      );
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <h1>Inscription envoyée</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Votre compte est en attente d'approbation. Vous pourrez vous connecter dès qu'un inspecteur aura validé votre compte.
        </p>
        <Link to="/login">Retour à la connexion</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1>Inscription</h1>
      {error && (
        <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-2)', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div>
          <label>Prénom</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div>
          <label>Nom</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div>
          <label>E-mail</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Mot de passe</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>École</label>
          <select name="schoolId" value={formData.schoolId} onChange={handleChange} required>
            <option value="">Sélectionnez votre école</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ marginTop: 'var(--space-1)' }}>S'inscrire</button>
      </form>
      <p style={{ marginTop: 'var(--space-3)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
        Vous avez déjà un compte ? <Link to="/login">Connectez-vous ici</Link>
      </p>
    </AuthLayout>
  );
}
