import { useState, useEffect } from 'react';
import client from '../api/client';
import { RANKS, NON_TITULARISE_RANKS, DAY_LABELS_FR } from '../constants/ranks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatDate(isoString) {
  if (!isoString) return '—';
  const [year, month, day] = isoString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', nominationDate: '', rank: '', diploma: '', schoolId: '',
  });
  const [schedule, setSchedule] = useState([]);
  const [newEntry, setNewEntry] = useState({ day: 'Monday', startTime: '', endTime: '' });
  const [inspections, setInspections] = useState([]);
  const [newInspectionDate, setNewInspectionDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/schools').then((response) => setSchools(response.data));
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
        schoolId: data.schoolId || '',
      });
      setSchedule(data.schedule || []);
      setInspections(data.inspections || []);
    });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const isNonTitularise = NON_TITULARISE_RANKS.includes(formData.rank);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const response = await client.put('/teachers/me', {
        ...formData,
        dateOfBirth: formData.dateOfBirth || null,
        nominationDate: isNonTitularise ? null : (formData.nominationDate || null),
        schoolId: Number(formData.schoolId),
      });
      setMessage('Profil mis à jour.');
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
    await client.delete(`/teachers/me/schedule/${id}`);
    setSchedule(schedule.filter((entry) => entry.id !== id));
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
    await client.delete(`/teachers/me/inspections/${id}`);
    setInspections(inspections.filter((i) => i.id !== id));
  };

  if (!profile) return <p style={{ padding: 'var(--space-3)' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3)' }}>
      <h1>Mon profil</h1>
      {message && <p style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>{message}</p>}
      {error && <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 340px' }}>
          <h2>Informations personnelles</h2>
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
              <label>Date de naissance</label>
              <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            <div>
              <label>Grade</label>
              <select name="rank" value={formData.rank} onChange={handleChange} required>
                <option value="">Sélectionnez un grade</option>
                {RANKS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {!isNonTitularise && (
              <div>
                <label>Date de nomination</label>
                <input name="nominationDate" type="date" value={formData.nominationDate} onChange={handleChange} />
              </div>
            )}
            <div>
              <label>Diplôme</label>
              <input name="diploma" value={formData.diploma} onChange={handleChange} />
            </div>
            <div>
              <label>École</label>
              <select name="schoolId" value={formData.schoolId} onChange={handleChange} required>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" style={{ marginTop: '4px' }}>Enregistrer</button>
          </form>
        </div>

        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="card">
            <h2>Mon emploi du temps</h2>
            {schedule.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Aucun horaire renseigné.</p>}
            {schedule.map((entry) => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--color-border)',
              }}>
                <span>{DAY_LABELS_FR[DAYS[entry.day]]} {entry.startTime}–{entry.endTime}</span>
                <button type="button" className="danger" onClick={() => handleDeleteEntry(entry.id)}>Supprimer</button>
              </div>
            ))}
            <form onSubmit={handleAddEntry} style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              <select value={newEntry.day} onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })} style={{ flex: '1 1 100px' }}>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS_FR[d]}</option>)}
              </select>
              <input type="time" value={newEntry.startTime} onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })} required style={{ flex: '1 1 100px' }} />
              <input type="time" value={newEntry.endTime} onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })} required style={{ flex: '1 1 100px' }} />
              <button type="submit" style={{ flex: '1 1 100%' }}>Ajouter un horaire</button>
            </form>
          </div>

          <div className="card">
            <h2>Mes dates d'inspection</h2>
            {inspections.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Aucune date d'inspection.</p>}
            {inspections.map((inspection) => (
              <div key={inspection.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--color-border)',
              }}>
                <span>{formatDate(inspection.date)}</span>
                <button type="button" className="danger" onClick={() => handleDeleteInspection(inspection.id)}>Supprimer</button>
              </div>
            ))}
            <form onSubmit={handleAddInspection} style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-2)' }}>
              <input type="date" value={newInspectionDate} onChange={(e) => setNewInspectionDate(e.target.value)} required style={{ flex: 1 }} />
              <button type="submit">Ajouter</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
