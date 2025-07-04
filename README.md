# Real-Time Chat Application with Socket.io

This assignment focuses on building a real-time chat application using Socket.io, implementing bidirectional communication between clients and server.

## Features Implemented
1. Real-time messaging using Socket.io
2. User authentication and persistence
3. Private messaging
4. Real-time notifications
5. Advanced features like typing indicators and read receipts
6. Message Storage using mongo db

## Project Structure

```
chat-mern-app/
├── chat-fronted/           # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── auth/           # Auth Logic
│   │   ├── client/         # socket connection setup
│   │   ├── layout/         # Chat UI layout
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── chat-backend/           # Node.js back-end
│   ├── middleware/         # Project Middleware
│   ├── models/             # Mongo db Data models
│   ├── routes/             # Routes configuration
│   ├── index.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

1. Clone the repository
```bash
git clone repository-link.git
cd chat-frontend
npm install
npm start

cd chat-backend
npm install
node index.js
```

### Chat-frontend is available at
```
http://localhost:3000
```
### Chat-Backend is listening at
```
http://localhost:5000
```


# Contributions
### Contributions are welcome Feel free to fork and make your own modifications.
