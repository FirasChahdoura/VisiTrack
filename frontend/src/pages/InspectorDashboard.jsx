import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { RANKS, DAY_LABELS_FR } from '../constants/ranks';
import { useSearch } from '../context/SearchContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatDate(isoString) {
  if (!isoString) return '—';
  const [year, month, day] = isoString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

function getDisplaySchedule(schedule, dayFilter) {
  const relevant = dayFilter
    ? schedule.filter((s) => DAYS[s.day] === dayFilter)
    : schedule;

  const sorted = [...relevant].sort((a, b) => a.day - b.day);
  const shown = sorted.slice(0, 2);
  const remaining = sorted.length - shown.length;

  return { shown, remaining };
}

export default function InspectorDashboard() {
  const [pending, setPending] = useState([]);
  const [schools, setSchools] = useState([]);
  const { filters, setFilters, results, setResults, count, setCount } = useSearch();
  const [error, setError] = useState('');

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
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const response = await client.get('/teachers/search', { params });
      setResults(response.data.results);
      setCount(response.data.count);
    } catch {
      setError('Échec de la recherche.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <h1>Tableau de bord de l'inspecteur</h1>

      <div className="card">
        <h2>Inscriptions en attente</h2>
        {pending.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Aucune inscription en attente.</p>}
        {pending.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {pending.map((t) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-1) 0', borderBottom: '1px solid var(--color-border)',
              }}>
                <span>{t.firstName} {t.lastName} — {t.email}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => handleApprove(t.id)}>Approuver</button>
                  <button type="button" className="danger" onClick={() => handleReject(t.id)}>Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
        <div className="card" style={{ width: '280px', flexShrink: 0 }}>
          <h2>Filtres</h2>
          {error && <p style={{ color: 'var(--color-error)', fontSize: '14px' }}>{error}</p>}
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div>
              <label>Nom</label>
              <input name="name" value={filters.name} onChange={handleFilterChange} />
            </div>
            <div>
              <label>Jour</label>
              <select name="day" value={filters.day} onChange={handleFilterChange}>
                <option value="">Tous les jours</option>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS_FR[d]}</option>)}
              </select>
            </div>
            <div>
              <label>Heure de début</label>
              <input type="time" name="fromTime" value={filters.fromTime} onChange={handleFilterChange} />
            </div>
            <div>
              <label>Heure de fin</label>
              <input type="time" name="toTime" value={filters.toTime} onChange={handleFilterChange} />
            </div>
            <div>
              <label>Grade</label>
              <select name="rank" value={filters.rank} onChange={handleFilterChange}>
                <option value="">Tous les grades</option>
                {RANKS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label>École</label>
              <select name="schoolId" value={filters.schoolId} onChange={handleFilterChange}>
                <option value="">Toutes les écoles</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label>Signaler si non inspecté depuis (mois)</label>
              <input type="number" name="notInspectedInMonths" value={filters.notInspectedInMonths} onChange={handleFilterChange} />
            </div>
            <button type="submit" style={{ marginTop: '4px' }}>Rechercher</button>
          </form>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 0 }}>
          <h2>Résultats {count !== null && <span style={{ fontWeight: 400, fontSize: '15px', color: 'var(--color-text-muted)' }}>({count} trouvé(s))</span>}</h2>
          {results.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Lancez une recherche pour voir les résultats.</p>}
          {results.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th><th>École</th><th>Grade</th><th>Emploi du temps</th><th>Dernière inspection</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((t) => (
                    <tr key={t.id}>
                      <td><Link to={`/inspector/teacher/${t.id}`}>{t.firstName} {t.lastName}</Link></td>
                      <td>{t.school}</td>
                      <td>{RANKS[t.rank]?.label || '—'}</td>
                      <td>
                        {(() => {
                          const { shown, remaining } = getDisplaySchedule(t.schedule, filters.day);
                          return (
                            <>
                              {shown.map((s, i) => (
                                <div key={i} style={{ fontSize: '13px' }}>{DAY_LABELS_FR[DAYS[s.day]]} {s.startTime}–{s.endTime}</div>
                              ))}
                              {remaining > 0 && (
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                  +{remaining} autre{remaining > 1 ? 's' : ''}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </td>
                      <td>{formatDate(t.lastInspectionDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
