require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const passport = require('./config/auth');
const cookieParser = require('cookie-parser');

// Import core configurations
const connectDB = require('./config/database');
const { initMQTT, initSocketIO } = require('./config/mqtt');

// Middleware & services
require('./services/notifyTTL');
const { logger, consoleLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const alertRoutes = require('./routes/alertRoutes');
const chartRoutes = require('./routes/chartRoutes');
const tableRoutes = require('./routes/tableRoutes');
const userRoutes = require('./routes/userRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
   secure: true, // harus true di production (karena https)
    httpOnly: true,
    sameSite: 'none', // HARUS none biar bisa cross-domain (vercel <-> railway)
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(passport.initialize());

// === Setup Socket.IO ===
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
  }
});
initSocketIO(io);

// === API Routes ===
app.use('/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/summary', summaryRoutes);

// === Health Check ===
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', mqttConnected: true });
});

// === Error Handler & 404 ===
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// === Graceful Shutdown ===
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

// === Start Server ===
async function startServer() {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');
    initMQTT();
    server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}
startServer();
