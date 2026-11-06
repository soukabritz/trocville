const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const itemRoutes = require('./routes/item.routes');
const categoryRoutes = require('./routes/category.routes');
const tradeOfferRoutes = require('./routes/tradeOffer.routes');
const messageRoutes = require('./routes/message.routes');
const conversationRoutes = require('./routes/conversation.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives. Réessaie dans quelques minutes.' }
});

app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '200kb' }));
app.use(morgan('dev'));
app.use('/api/auth', authLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/trade-offers', tradeOfferRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
