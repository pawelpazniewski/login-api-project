const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const secretKey = 'YourSecretJWTKey';
const port = process.env.PORT || 3000;

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost/login_API', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Define the user model
const User = mongoose.model('User', {
    id: Number, // Add 'id' field as Number type
    email: String,
    password: String,
    name: String,
    country: String,
    city: String,
});

app.use(bodyParser.json());

// Endpoint to get all users
app.get('/users', async (req, res) => {
    try {
      // Retrieve all users from the database
      const users = await User.find({}, { _id: 0, password: 0 });
  
      // Remove the "_id" and "password" fields from the response
      res.json(users);
    } catch (error) {
      console.error('Error while fetching users:', error);
      res.status(500).json({ message: 'An error occurred while fetching users' });
    }
});

// Endpoint to get a single user by email
app.get('/user/:email', async (req, res) => {
    try {
      const email = req.params.email;
  
      // Find a user with the given email address
      const user = await User.findOne({ email }, { _id: 0, password: 0 });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error while searching for a user:', error);
      res.status(500).json({ message: 'An error occurred while searching for a user' });
    }
});

// Variable to store the last used user ID
let lastUserId = 0;

// Endpoint to create a new user
app.post('/register', async (req, res) => {
    try {
      const { email, password, name, country, city } = req.body;
      const missingFields = [];
  
      // Check if all required fields are provided
      if (!email) {
        missingFields.push('email');
      }
      if (!password) {
        missingFields.push('password');
      }
      if (!name) {
        missingFields.push('name');
      }
      if (!country) {
        missingFields.push('country');
      }
      if (!city) {
        missingFields.push('city');
      }
  
      if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing fields: ${missingFields.join(', ')}` });
      }
  
      // Check if a user with the given email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email address already exists' });
      }
  
      // Get the highest user ID from the database
      const highestUserId = await User.findOne({}, {}, { sort: { 'id': -1 } });
  
      // Assign a unique 'id' based on the highest existing 'id'
      const newUserId = highestUserId ? highestUserId.id + 1 : 1;
  
      const newUser = new User({
        id: newUserId, // Set a unique 'id'
        email,
        password,
        name,
        country,
        city,
      });
  
      await newUser.save();
  
      // Add the 'id' of the new user to the response
      res.json({ message: 'User created successfully', id: newUserId });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
});

// Endpoint for user login and JWT generation
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if login credentials are provided
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email address and password' });
      }
  
      // Find a user with the given email
      const user = await User.findOne({ email });
  
      // Check password validity
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid login credentials' });
      }
  
      // Generate a JWT
      const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
});

// Endpoint for deleting a user (with authentication)
app.delete('/user', verifyToken, async (req, res) => {
  try {
    const { email } = req.decoded;

    // Delete the user from the database
    await User.findOneAndDelete({ email });

    res.json({ message: 'User has been deleted' });
  } catch (error) {
    console.error('Error while deleting a user:', error);
    res.status(500).json({ message: 'An error occurred while deleting a user' });
  }
});

// Middleware for JWT verification
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(403).json({ message: 'No authentication token provided' });
    }
  
    jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => { // Remove "Bearer" from the token
      if (err) {
        return res.status(401).json({ message: 'Invalid authentication token' });
      }
  
      req.decoded = decoded;
      next();
    });
}


// Endpoint for logging out (not required for JWT)
app.post('/logout', verifyToken, (req, res) => {
    try {
      // Perform the logout process, e.g., remove the token from a blacklist
  
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'An error occurred during logout' });
    }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
