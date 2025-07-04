import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Register({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, password });
      login(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Register</button>
      </form>
      <p className="text-sm mt-3 text-center">
        Already have an account? <button onClick={onSwitch} className="text-blue-600 underline">Login</button>
      </p>
    </div>
  );
}
