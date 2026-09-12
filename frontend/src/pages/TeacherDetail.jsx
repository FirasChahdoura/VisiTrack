import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { RANKS, DAY_LABELS_FR } from '../constants/ranks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatDate(isoString) {
  if (!isoString) return '—';
  const [year, month, day] = isoString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function TeacherDetail() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/teachers/${id}`)
      .then((response) => setTeacher(response.data))
      .catch(() => setError("Impossible de charger l'enseignant."));
  }, [id]);

  if (error) return <p style={{ padding: 'var(--space-3)', color: 'var(--color-error)' }}>{error}</p>;
  if (!teacher) return <p style={{ padding: 'var(--space-3)' }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3)' }}>
      <Link to="/inspector">← Retour à la recherche</Link>
      <h1 style={{ marginTop: 'var(--space-2)' }}>{teacher.firstName} {teacher.lastName}</h1>

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
        <div className="card" style={{ flex: '1 1 340px' }}>
          <h2>Identité</h2>
          <InfoRow label="E-mail" value={teacher.email} />
          <InfoRow label="École" value={teacher.school} />
          <InfoRow label="Date de naissance" value={formatDate(teacher.dateOfBirth)} />
          <InfoRow label="Date de nomination" value={formatDate(teacher.nominationDate)} />
          <InfoRow label="Grade" value={teacher.rank !== null ? RANKS[teacher.rank]?.label : '—'} />
          <InfoRow label="Diplôme" value={teacher.diploma || '—'} />
        </div>

        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="card">
            <h2>Emploi du temps</h2>
            {teacher.schedule.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Aucun horaire.</p>}
            {teacher.schedule.map((s, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                {DAY_LABELS_FR[DAYS[s.day]]} {s.startTime}–{s.endTime}
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Inspections</h2>
            {teacher.inspections.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Aucune inspection enregistrée.</p>}
            {teacher.inspections.map((insp) => (
              <div key={insp.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                {formatDate(insp.date)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
