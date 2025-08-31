# Dummy Backend for React Chat Application

This is a dummy Python Flask backend that simulates all the functionality needed for the React chat application.

## Features

- **Authentication**: Login, signup, logout, token verification
- **Chat Management**: Create, read, update, delete chats
- **Message Handling**: Send messages and receive AI-like responses
- **Chat History**: Persistent chat storage with dummy data
- **Realistic Simulation**: Typing delays and contextual responses

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Chat Management
- `GET /api/chat/history` - Get all user chats
- `GET /api/chat/<chat_id>` - Get specific chat with messages
- `POST /api/chat` - Create new chat
- `POST /api/chat/<chat_id>/message` - Send message to chat
- `DELETE /api/chat/<chat_id>` - Delete specific chat
- `DELETE /api/chat/clear` - Clear all user chats

### Health Check
- `GET /health` - Server health status

## Test User

A pre-existing test user is available:
- **Email**: `user@example.com`
- **Password**: `password123`

## Dummy Data

The backend includes realistic dummy chat data with:
- Multiple conversation topics
- Formatted AI responses with markdown
- Code examples and explanations
- Realistic timestamps

## Features Simulated

1. **JWT Authentication**: Proper token-based auth with expiration
2. **AI Response Generation**: Context-aware responses based on message content
3. **Typing Delays**: Realistic 1-3 second delays for AI responses
4. **Chat Persistence**: In-memory storage that persists during session
5. **Error Handling**: Proper HTTP status codes and error messages
6. **CORS Support**: Enabled for frontend integration

## Usage with React Frontend

Make sure your React frontend is configured to use `http://localhost:5000` as the API base URL. The backend is fully compatible with the existing React app structure.
