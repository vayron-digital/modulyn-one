import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import projectRoutes from './routes/projects';
import propertyRoutes from './routes/properties';
import taskRoutes from './routes/tasks';
import callRoutes from './routes/calls';
import teamRoutes from './routes/team';
import coldCallsRoutes from './routes/cold_calls';
import fastspringRoutes from './routes/fastspring';
import tenantRoutes from './routes/tenants';
import { NotificationService } from './services/notificationService';
import path from 'path';
// --- Socket.IO imports ---
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ChatService } from './services/chatService';
import dashboardRoutes from './routes/dashboard';
import { requireAuth } from './middleware/requireAuth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://crm-platform-neon.vercel.app',
  'https://crm-platform-git-master-fortune-legacy.vercel.app/',
  'https://crm-platform-ialv4reps-fortune-legacy.vercel.app/',
  'http://localhost:3000',
  'http://localhost:5173', // <-- Add this for Vite dev server
  'http://192.168.1.249:5173',
  'https://fortune4-crm-54067a45e825.herokuapp.com',
];

// --- Create HTTP server and attach Socket.IO ---
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY?.slice(0, 8)); // Should start with eyJ...

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/team', requireAuth, teamRoutes);
app.use('/api/cold-calls', coldCallsRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/fastspring', fastspringRoutes);
app.use('/api/tenants', tenantRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// All other GET requests not handled before will return your React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    supabase: 'connected',
    url: process.env.SUPABASE_URL
  });
});

// --- Basic Socket.IO connection handler ---
io.on('connection', (socket) => {
  console.log(`Socket.IO: User connected: ${socket.id}`);

  // Join a chat thread (room)
  socket.on('joinThread', async ({ threadId }) => {
    socket.join(`thread_${threadId}`);
    console.log(`Socket.IO: ${socket.id} joined thread ${threadId}`);
    // Optionally emit previous messages
    try {
      const messages = await ChatService.getMessages(threadId);
      socket.emit('threadMessages', { threadId, messages });
    } catch (err) {
      socket.emit('error', { message: 'Failed to fetch messages', details: err });
    }
  });

  // Send a message
  socket.on('sendMessage', async ({ threadId, senderId, content, type = 'text' }) => {
    try {
      const message = await ChatService.sendMessage(threadId, senderId, content, type);
      // Broadcast to all in the thread
      io.to(`thread_${threadId}`).emit('newMessage', { threadId, message });
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message', details: err });
    }
  });

  // Share a CRM entity (lead, event, etc.)
  socket.on('shareEntity', async ({ threadId, messageId, entityType, entityId, action, meta }) => {
    try {
      const shared = await ChatService.shareEntity(messageId, entityType, entityId, action, meta);
      io.to(`thread_${threadId}`).emit('entityShared', { threadId, shared });
    } catch (err) {
      socket.emit('error', { message: 'Failed to share entity', details: err });
    }
  });

  // TODO: Add attachment upload, typing indicators, presence, etc.
});

// Start notification service
NotificationService.getInstance();

// --- Start server with Socket.IO ---
server.listen(PORT, () => {
  console.log(`