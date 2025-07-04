import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import socket from '../client/socket';

const Chat = () => {
  const { user, logout } = useContext(AuthContext);
  const username = user?.username;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [privateChats, setPrivateChats] = useState({});
  const [activePrivateChat, setActivePrivateChat] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const filteredMessages = messages.filter((msg) =>
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!username) return;

    socket.emit('new-user', username);

    const handleMessage = (data) => setMessages((prev) => [...prev, data]);
    const handleUserList = (userList) => setUsers(userList);
    const handlePrivateMessage = (data) => {
      setPrivateChats((prev) => {
        const updated = { ...prev };
        const sender = data.self ? activePrivateChat : data.from;
        if (!updated[sender]) updated[sender] = [];
        updated[sender].push(data);
        return updated;
      });
    };

    const handleTyping = (u) => setTypingUsers((prev) => [...new Set([...prev, u])]);
    const handleStopTyping = (u) => setTypingUsers((prev) => prev.filter((name) => name !== u));

    socket.on('chat-message', handleMessage);
    socket.on('user-list', handleUserList);
    socket.on('private-message', handlePrivateMessage);
    socket.on('user-typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);

    return () => {
      socket.off('chat-message', handleMessage);
      socket.off('user-list', handleUserList);
      socket.off('private-message', handlePrivateMessage);
      socket.off('user-typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
    };
  }, [username, activePrivateChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, privateChats]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const timestamp = new Date().toLocaleTimeString();

    if (activePrivateChat) {
      socket.emit('private-message', { to: activePrivateChat, from: username, message });
      setPrivateChats((prev) => {
        const updated = { ...prev };
        if (!updated[activePrivateChat]) updated[activePrivateChat] = [];
        updated[activePrivateChat].push({ from: username, message, timestamp, self: true });
        return updated;
      });
    } else {
      socket.emit('chat-message', { from: username, message, timestamp });
    }

    setMessage('');
    socket.emit('stop-typing', username);
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('user-typing', username);
    }
    setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', username);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {username}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-6">
        <aside className="w-1/4 pr-4 max-h-[500px] overflow-y-auto border-r border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
    🟢 Online Users
  </h2>
  <ul className="space-y-2">
    {users.map((u, idx) => {
      const isSelf = u === username;
      const isActive = u === activePrivateChat;

      return (
        <li
          key={idx}
          onClick={() => !isSelf && setActivePrivateChat(u)}
          className={`flex items-center gap-3 p-2 rounded-lg transition cursor-pointer
            ${isSelf ? 'text-gray-400 cursor-default' : ''}
            ${isActive ? 'bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <div className="w-8 h-8 flex items-center justify-center bg-green-500 text-white font-bold rounded-full uppercase">
            {u.charAt(0)}
          </div>
          <span className="truncate">{u}</span>
          {isSelf && <span className="ml-auto text-xs italic text-gray-400">(You)</span>}
        </li>
      );
    })}
  </ul>
</aside>


        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="mb-3 p-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />

          {/* Messages */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 border rounded-md h-[450px] overflow-y-auto space-y-2">
            {(activePrivateChat ? privateChats[activePrivateChat] : filteredMessages)?.map(
              (msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-2 max-w-sm rounded-lg shadow ${
                      msg.system
                        ? 'text-center italic text-gray-500'
                        : msg.self
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
                    }`}
                  >
                    {!msg.system && (
                      <span className="block text-xs font-semibold mb-1">{msg.from}</span>
                    )}
                    <span>{msg.message}</span>
                    <div className="text-[10px] text-right mt-1 opacity-70">{msg.timestamp}</div>
                  </div>
                </div>
              )
            )}
            {typingUsers.map((u, i) => (
              <p key={`typing-${i}`} className="text-gray-400 italic">
                {u} is typing...
              </p>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder={`Message ${activePrivateChat || 'everyone'}...`}
              className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              ➤
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Chat;
