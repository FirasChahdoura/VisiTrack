import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Register() {
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    schoolId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/schools').then((response) => {
      setSchools(response.data);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await client.post('/auth/register', {
        ...formData,
        schoolId: Number(formData.schoolId),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  if (success) {
    return (
      <div>
        <h1>Registration submitted</h1>
        <p>Your account is pending approval. You'll be able to log in once an inspector approves your account.</p>
        <Link to="/login">Back to login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
      <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

      <select name="schoolId" value={formData.schoolId} onChange={handleChange} required>
        <option value="">Select your school</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </select>

      <button type="submit">Register</button>
    </form>
  );
}