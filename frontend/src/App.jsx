import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole="Teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspector"
        element={
          <ProtectedRoute allowedRole="Inspector">
            <InspectorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;