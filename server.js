const express = require('express');

const connectDB = require('./config/db');

connectDB();

const app = express();

//Validate json entry data Middleware init
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running!'));

//Define routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
