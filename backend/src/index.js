// Validate env vars first
require('./config/env');

const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const syncRoutes = require('./routes/syncRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
