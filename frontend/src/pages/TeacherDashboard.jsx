import { useState, useEffect } from 'react';
import client from '../api/client';
import { RANKS, NON_TITULARISE_RANKS } from '../constants/ranks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatDate(isoString) {
  const [year, month, day] = isoString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', nominationDate: '', rank: '', diploma: '',
  });
  const [schedule, setSchedule] = useState([]);
  const [newEntry, setNewEntry] = useState({ day: 'Monday', startTime: '', endTime: '' });
  const [inspections, setInspections] = useState([]);
  const [newInspectionDate, setNewInspectionDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/teachers/me').then((response) => {
      const data = response.data;
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        nominationDate: data.nominationDate ? data.nominationDate.split('T')[0] : '',
        rank: data.rank !== null ? RANKS[data.rank]?.value || '' : '',
        diploma: data.diploma || '',
      });
      setSchedule(data.schedule || []);
      setInspections(data.inspections || []);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isNonTitularise = NON_TITULARISE_RANKS.includes(formData.rank);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await client.put('/teachers/me', {
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
        nominationDate: isNonTitularise ? null : (formData.nominationDate || null),
      });
      setMessage('Profile updated.');
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await client.post('/teachers/me/schedule', newEntry);
      setSchedule([...schedule, response.data]);
      setNewEntry({ day: 'Monday', startTime: '', endTime: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add schedule entry.');
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await client.delete(`/teachers/me/schedule/${id}`);
      setSchedule(schedule.filter((entry) => entry.id !== id));
    } catch (err) {
      setError('Could not delete schedule entry.');
    }
  };

  const handleAddInspection = async (e) => {
    e.preventDefault();
    try {
      const response = await client.post('/teachers/me/inspections', { date: newInspectionDate });
      setInspections([...inspections, response.data]);
      setNewInspectionDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add inspection date.');
    }
  };

  const handleDeleteInspection = async (id) => {
    try {
      await client.delete(`/teachers/me/inspections/${id}`);
      setInspections(inspections.filter((i) => i.id !== id));
    } catch (err) {
      setError('Could not delete inspection date.');
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h1>My profile</h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />

        <label>
          Date of birth
          <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
        </label>

        <label>
          Rank
          <select name="rank" value={formData.rank} onChange={handleChange} required>
            <option value="">Select rank</option>
            {RANKS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        {!isNonTitularise && (
          <label>
            Nomination date
            <input name="nominationDate" type="date" value={formData.nominationDate} onChange={handleChange} />
          </label>
        )}

        <input name="diploma" placeholder="Diploma" value={formData.diploma} onChange={handleChange} />

        <button type="submit">Save</button>
      </form>

      <h2>My schedule</h2>
      <ul>
        {schedule.map((entry) => (
          <li key={entry.id}>
            {DAYS[entry.day]} {entry.startTime}–{entry.endTime}
            <button type="button" onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddEntry}>
        <select
          value={newEntry.day}
          onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="time"
          value={newEntry.startTime}
          onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
          required
        />
        <input
          type="time"
          value={newEntry.endTime}
          onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
          required
        />
        <button type="submit">Add schedule entry</button>
      </form>

      <h2>My inspection dates</h2>
      <ul>
        {inspections.map((inspection) => (
          <li key={inspection.id}>
            {formatDate(inspection.date)}
            <button type="button" onClick={() => handleDeleteInspection(inspection.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddInspection}>
        <input
          type="date"
          value={newInspectionDate}
          onChange={(e) => setNewInspectionDate(e.target.value)}
          required
        />
        <button type="submit">Add inspection date</button>
      </form>
    </div>
  );
}
