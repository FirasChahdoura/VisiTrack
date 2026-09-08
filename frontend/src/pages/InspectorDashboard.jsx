import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { RANKS } from '../constants/ranks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatDate(isoString) {
  if (!isoString) return '—';
  const [year, month, day] = isoString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export default function InspectorDashboard() {
  const [pending, setPending] = useState([]);
  const [filters, setFilters] = useState({
    name: '', day: '', fromTime: '', toTime: '', rank: '', notInspectedInMonths: '24', schoolId: '',
  });
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(null);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    loadPending();
    client.get('/schools').then((response) => setSchools(response.data));
  }, []);

  const loadPending = () => {
    client.get('/teachers/pending').then((response) => setPending(response.data));
  };

  const handleApprove = async (id) => {
    await client.put(`/teachers/${id}/approve`);
    setPending(pending.filter((t) => t.id !== id));
  };

  const handleReject = async (id) => {
    await client.put(`/teachers/${id}/reject`);
    setPending(pending.filter((t) => t.id !== id));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Strip empty filters so we don't send blank query params
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      );
      const response = await client.get('/teachers/search', { params });
      setResults(response.data.results);
      setCount(response.data.count);
    } catch (err) {
      setError('Search failed.');
    }
  };

  return (
    <div>
      <h1>Inspector dashboard</h1>

      <h2>Pending registrations</h2>
      {pending.length === 0 && <p>No pending registrations.</p>}
      <ul>
        {pending.map((t) => (
          <li key={t.id}>
            {t.firstName} {t.lastName} — {t.email}
            <button type="button" onClick={() => handleApprove(t.id)}>Approve</button>
            <button type="button" onClick={() => handleReject(t.id)}>Reject</button>
          </li>
        ))}
      </ul>

      <h2>Search teachers</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSearch}>
        <input name="name" placeholder="Name" value={filters.name} onChange={handleFilterChange} />

        <select name="day" value={filters.day} onChange={handleFilterChange}>
          <option value="">Any day</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <input type="time" name="fromTime" value={filters.fromTime} onChange={handleFilterChange} />
        <input type="time" name="toTime" value={filters.toTime} onChange={handleFilterChange} />

        <select name="rank" value={filters.rank} onChange={handleFilterChange}>
          <option value="">Any rank</option>
          {RANKS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        <select name="schoolId" value={filters.schoolId} onChange={handleFilterChange}>
          <option value="">Any school</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="number"
          name="notInspectedInMonths"
          placeholder="Not inspected in (months)"
          value={filters.notInspectedInMonths}
          onChange={handleFilterChange}
        />

        <button type="submit">Search</button>
      </form>

      {count !== null && <p>{count} teacher{count !== 1 ? 's' : ''} found</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>School</th><th>Rank</th><th>Schedule</th><th>Last inspection</th>
          </tr>
        </thead>
        <tbody>
          {results.map((t) => (
            <tr key={t.id}>
              <td><Link to={`/inspector/teacher/${t.id}`}>{t.firstName} {t.lastName}</Link></td>
              <td>{t.email}</td>
              <td>{t.school}</td>
              <td>{RANKS[t.rank]?.label || '—'}</td>
              <td>
                {t.schedule.map((s, i) => (
                  <div key={i}>{DAYS[s.day]} {s.startTime}–{s.endTime}</div>
                ))}
              </td>
              <td>{formatDate(t.lastInspectionDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
