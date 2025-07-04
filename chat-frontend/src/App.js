import { useContext, useState, useEffect } from 'react';
import socket from './client/socket';
import './index.css';
import { AuthProvider } from './context/AuthProvider';
import { AuthContext } from './context/AuthContext';
import Login from './auth/Login';
import Register from './auth/Register';
import Chat from './layout/Chat';

function AppRouter() {
  const { user } = useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (user) {
      socket.auth.token = user.token;
      socket.connect();
    }
  }, [user]);

  if (!user) return showRegister ? <Register onSwitch={() => setShowRegister(false)} /> : <Login onSwitch={() => setShowRegister(true)} />;

  return <Chat />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}