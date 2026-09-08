import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { RANKS } from '../constants/ranks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function formatDate(isoString) {
  if (!isoString) return '—';
  const [year, month, day] = isoString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export default function TeacherDetail() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/teachers/${id}`)
      .then((response) => setTeacher(response.data))
      .catch(() => setError('Could not load teacher.'));
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!teacher) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/inspector">← Back to search</Link>
      <h1>{teacher.firstName} {teacher.lastName}</h1>
      <p>Email: {teacher.email}</p>
      <p>School: {teacher.school}</p>
      <p>Date of birth: {formatDate(teacher.dateOfBirth)}</p>
      <p>Nomination date: {formatDate(teacher.nominationDate)}</p>
      <p>Rank: {teacher.rank !== null ? RANKS[teacher.rank]?.label : '—'}</p>
      <p>Diploma: {teacher.diploma || '—'}</p>

      <h2>Schedule</h2>
      <ul>
        {teacher.schedule.map((s, i) => (
          <li key={i}>{DAYS[s.day]} {s.startTime}–{s.endTime}</li>
        ))}
      </ul>

      <h2>Inspections</h2>
      <ul>
        {teacher.inspections.map((insp) => (
          <li key={insp.id}>{formatDate(insp.date)}</li>
        ))}
      </ul>
    </div>
  );
}
