from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
import uuid
import time
import random

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

# Secret key for JWT tokens
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Dummy data storage
users = {
    'user@example.com': {
        'id': '1',
        'name': 'John Doe',
        'email': 'user@example.com',
        'password': 'password123'  # In real app, this would be hashed
    }
}

# Chat history storage
chat_history = {
    '1': [
        {
            'id': 'chat-1',
            'title': 'Welcome to ChatGPT',
            'created_at': '2024-01-15T10:30:00Z',
            'updated_at': '2024-01-15T11:45:00Z',
            'messages': [
                {
                    'id': 'msg-1',
                    'content': 'Hello! How can I help you today?',
                    'role': 'assistant',
                    'timestamp': '2024-01-15T10:30:00Z'
                },
                {
                    'id': 'msg-2',
                    'content': 'Can you explain quantum computing?',
                    'role': 'user',
                    'timestamp': '2024-01-15T10:31:00Z'
                },
                {
                    'id': 'msg-3',
                    'content': 'Quantum computing is a revolutionary computing paradigm that leverages the principles of quantum mechanics to process information in fundamentally different ways than classical computers.\n\n**Key Concepts:**\n\n1. **Qubits**: Unlike classical bits that can only be 0 or 1, qubits can exist in a superposition of both states simultaneously.\n\n2. **Superposition**: This allows quantum computers to process multiple possibilities at once.\n\n3. **Entanglement**: Qubits can be interconnected in ways that classical particles cannot, enabling complex calculations.\n\n**Applications:**\n- Cryptography and security\n- Drug discovery and molecular modeling\n- Financial modeling\n- Artificial intelligence optimization\n\nQuantum computers excel at specific problems like factoring large numbers, optimization, and simulation of quantum systems, but they\'re not necessarily faster for all computing tasks.',
                    'role': 'assistant',
                    'timestamp': '2024-01-15T10:32:00Z'
                }
            ]
        },
        {
            'id': 'chat-2',
            'title': 'Python Programming Help',
            'created_at': '2024-01-16T14:20:00Z',
            'updated_at': '2024-01-16T15:10:00Z',
            'messages': [
                {
                    'id': 'msg-4',
                    'content': 'I need help with Python list comprehensions',
                    'role': 'user',
                    'timestamp': '2024-01-16T14:20:00Z'
                },
                {
                    'id': 'msg-5',
                    'content': 'I\'d be happy to help you with Python list comprehensions! They\'re a concise way to create lists based on existing iterables.\n\n**Basic Syntax:**\n```python\n[expression for item in iterable if condition]\n```\n\n**Examples:**\n\n1. **Basic list comprehension:**\n```python\n# Create a list of squares\nsquares = [x**2 for x in range(10)]\n# Result: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n```\n\n2. **With condition:**\n```python\n# Even numbers only\nevens = [x for x in range(20) if x % 2 == 0]\n# Result: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]\n```\n\n3. **String manipulation:**\n```python\n# Uppercase words longer than 3 characters\nwords = [\"hello\", \"hi\", \"python\", \"code\"]\nlong_words = [word.upper() for word in words if len(word) > 3]\n# Result: [\"HELLO\", \"PYTHON\", \"CODE\"]\n```\n\nList comprehensions are more readable and often faster than traditional for loops for creating lists!',
                    'role': 'assistant',
                    'timestamp': '2024-01-16T14:21:30Z'
                }
            ]
        },
        {
            'id': 'chat-3',
            'title': 'Machine Learning Basics',
            'created_at': '2024-01-17T09:15:00Z',
            'updated_at': '2024-01-17T09:45:00Z',
            'messages': [
                {
                    'id': 'msg-6',
                    'content': 'What are the main types of machine learning?',
                    'role': 'user',
                    'timestamp': '2024-01-17T09:15:00Z'
                },
                {
                    'id': 'msg-7',
                    'content': 'There are three main types of machine learning, each with different approaches and use cases:\n\n## 1. **Supervised Learning**\n- **Definition**: Learning with labeled training data\n- **Goal**: Predict outcomes for new, unseen data\n- **Examples**: \n  - Classification (spam detection, image recognition)\n  - Regression (price prediction, weather forecasting)\n- **Algorithms**: Linear regression, decision trees, neural networks\n\n## 2. **Unsupervised Learning**\n- **Definition**: Finding patterns in data without labels\n- **Goal**: Discover hidden structures in data\n- **Examples**:\n  - Clustering (customer segmentation)\n  - Dimensionality reduction (data visualization)\n  - Anomaly detection\n- **Algorithms**: K-means, hierarchical clustering, PCA\n\n## 3. **Reinforcement Learning**\n- **Definition**: Learning through interaction with an environment\n- **Goal**: Maximize cumulative reward through trial and error\n- **Examples**:\n  - Game playing (chess, Go)\n  - Robotics\n  - Autonomous vehicles\n- **Key Concepts**: Agent, environment, actions, rewards, policy\n\nEach type solves different kinds of problems and requires different approaches to data and model training!',
                    'role': 'assistant',
                    'timestamp': '2024-01-17T09:16:45Z'
                }
            ]
        }
    ]
}

# Predefined responses for chat simulation
sample_responses = [
    "That's a great question! Let me think about that for a moment...",
    "I understand what you're asking. Here's my perspective on that:",
    "That's an interesting topic. Let me break it down for you:",
    "I can help you with that. Here's what I would suggest:",
    "That's a complex question, but I'll do my best to explain:",
    "Great point! Let me elaborate on that:",
    "I see what you're getting at. Here's my analysis:",
    "That's exactly the kind of question I enjoy answering!",
    "Let me provide you with a comprehensive answer:",
    "I appreciate you asking about this. Here's what I think:"
]

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def simulate_typing_delay():
    """Simulate realistic typing delay"""
    time.sleep(random.uniform(1, 3))

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data['email']
    
    if email in users:
        return jsonify({'error': 'User already exists'}), 409
    
    # Create new user
    user_id = str(len(users) + 1)
    users[email] = {
        'id': user_id,
        'name': data['name'],
        'email': email,
        'password': data['password']  # In real app, hash this
    }
    
    # Initialize empty chat history for new user
    chat_history[user_id] = []
    
    token = generate_token(user_id)
    
    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user': {
            'id': user_id,
            'name': data['name'],
            'email': email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = users.get(data['email'])
    
    if not user or user['password'] != data['password']:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = generate_token(user['id'])
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email']
        }
    })

@app.route('/api/auth/verify', methods=['GET'])
def verify():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    # Find user
    user = None
    for email, user_data in users.items():
        if user_data['id'] == user_id:
            user = user_data
            break
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    # In a real app, you might want to blacklist the token
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    user_chats = chat_history.get(user_id, [])
    
    # Return simplified chat list (without full messages)
    chat_list = []
    for chat in user_chats:
        chat_list.append({
            'id': chat['id'],
            'title': chat['title'],
            'created_at': chat['created_at'],
            'updated_at': chat['updated_at']
        })
    
    return jsonify({'chats': chat_list})

@app.route('/api/chat/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    user_chats = chat_history.get(user_id, [])
    
    for chat in user_chats:
        if chat['id'] == chat_id:
            return jsonify({'chat': chat})
    
    return jsonify({'error': 'Chat not found'}), 404

@app.route('/api/chat', methods=['POST'])
def create_chat():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    data = request.get_json()
    message = data.get('message', '')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Create new chat
    chat_id = f'chat-{uuid.uuid4()}'
    now = datetime.utcnow().isoformat() + 'Z'
    
    # Generate title from first message (simplified)
    title = message[:50] + '...' if len(message) > 50 else message
    
    user_message_id = f'msg-{uuid.uuid4()}'
    assistant_message_id = f'msg-{uuid.uuid4()}'
    
    # Simulate AI response
    simulate_typing_delay()
    ai_response = random.choice(sample_responses) + f"\n\nRegarding your question about '{message[:30]}...', I think this is a fascinating topic that deserves a thoughtful response. Let me elaborate on the key points and provide you with a comprehensive answer that addresses your specific needs."
    
    new_chat = {
        'id': chat_id,
        'title': title,
        'created_at': now,
        'updated_at': now,
        'messages': [
            {
                'id': user_message_id,
                'content': message,
                'role': 'user',
                'timestamp': now
            },
            {
                'id': assistant_message_id,
                'content': ai_response,
                'role': 'assistant',
                'timestamp': now
            }
        ]
    }
    
    if user_id not in chat_history:
        chat_history[user_id] = []
    
    chat_history[user_id].insert(0, new_chat)  # Add to beginning for recent-first order
    
    return jsonify({
        'chat': new_chat,
        'message': 'Chat created successfully'
    }), 201

@app.route('/api/chat/<chat_id>/message', methods=['POST'])
def send_message(chat_id):
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    data = request.get_json()
    message = data.get('message', '')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    user_chats = chat_history.get(user_id, [])
    
    for chat in user_chats:
        if chat['id'] == chat_id:
            now = datetime.utcnow().isoformat() + 'Z'
            
            user_message_id = f'msg-{uuid.uuid4()}'
            assistant_message_id = f'msg-{uuid.uuid4()}'
            
            # Add user message
            user_message = {
                'id': user_message_id,
                'content': message,
                'role': 'user',
                'timestamp': now
            }
            
            chat['messages'].append(user_message)
            
            # Simulate AI response with delay
            simulate_typing_delay()
            
            # Generate AI response based on message content
            if 'code' in message.lower() or 'programming' in message.lower():
                ai_response = "I'd be happy to help you with coding! Here's what I suggest:\n\n```python\n# Example code\ndef example_function():\n    return 'Hello, World!'\n```\n\nThis is a basic example. Could you provide more details about what specific programming challenge you're working on?"
            elif 'explain' in message.lower() or 'what is' in message.lower():
                ai_response = f"Great question! Let me explain that concept for you.\n\n{random.choice(sample_responses)}\n\nThe topic you're asking about has several important aspects to consider. Would you like me to dive deeper into any particular area?"
            else:
                ai_response = f"{random.choice(sample_responses)}\n\nI notice you mentioned something interesting. Based on your message, I think the best approach would be to break this down into manageable steps. What specific aspect would you like to focus on first?"
            
            # Add assistant message
            assistant_message = {
                'id': assistant_message_id,
                'content': ai_response,
                'role': 'assistant',
                'timestamp': now
            }
            
            chat['messages'].append(assistant_message)
            chat['updated_at'] = now
            
            return jsonify({
                'message': assistant_message,
                'chat_id': chat_id
            })
    
    return jsonify({'error': 'Chat not found'}), 404

@app.route('/api/chat/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    user_chats = chat_history.get(user_id, [])
    
    for i, chat in enumerate(user_chats):
        if chat['id'] == chat_id:
            del user_chats[i]
            return jsonify({'message': 'Chat deleted successfully'})
    
    return jsonify({'error': 'Chat not found'}), 404

@app.route('/api/chat/clear', methods=['DELETE'])
def clear_all_chats():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    chat_history[user_id] = []
    
    return jsonify({'message': 'All chats cleared successfully'})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

if __name__ == '__main__':
    print("Starting dummy backend server...")
    print("Available endpoints:")
    print("  POST /api/auth/signup")
    print("  POST /api/auth/login") 
    print("  GET  /api/auth/verify")
    print("  POST /api/auth/logout")
    print("  GET  /api/chat/history")
    print("  GET  /api/chat/<chat_id>")
    print("  POST /api/chat")
    print("  POST /api/chat/<chat_id>/message")
    print("  DELETE /api/chat/<chat_id>")
    print("  DELETE /api/chat/clear")
    print("  GET  /health")
    print("\nTest user: user@example.com / password123")
    app.run(debug=True, host='0.0.0.0', port=5000)
