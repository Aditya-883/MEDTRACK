require('dotenv').config();


console.log("CHECK: ",process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// connect DB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});