import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import TeacherDetail from './pages/TeacherDetail';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

function HomeRedirect() {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'Inspector' ? '/inspector' : '/teacher'} replace />;
}

function App() {
  return (
    <>
      <Header />
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
        <Route
          path="/inspector/teacher/:id"
          element={
            <ProtectedRoute allowedRole="Inspector">
              <TeacherDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;