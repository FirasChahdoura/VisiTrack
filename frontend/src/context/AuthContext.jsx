import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function decodeToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now(); // exp is in seconds, Date.now() is ms
}

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem('token');
  const [token, setToken] = useState(isTokenValid(storedToken) ? storedToken : null);
  const role = token ? decodeToken(token)?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : null;

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
