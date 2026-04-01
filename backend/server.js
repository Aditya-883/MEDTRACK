require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes'); 


const app = express(); //  APP CREATED

// middlewares
app.use(cors());
app.use(express.json());

//  routes
app.use('/api/auth', authRoutes);

// (your existing routes)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// connect DB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});