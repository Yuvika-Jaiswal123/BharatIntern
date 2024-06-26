const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/registration', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    salt: String // Add salt field to store the salt value
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Hash password function
function hashPassword(password, salt) {
    const hash = crypto.createHash('sha256'); // Use SHA-256 hashing algorithm
    hash.update(password + salt); // Add salt to the password before hashing
    return hash.digest('hex'); // Return the hashed password
}

app.post('/register', async (req, res) => {
    const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
    const hashedPassword = hashPassword(req.body.password, salt); // Hash the password using SHA-256 and salt

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        salt: salt // Store the salt value in the database
    });

    newUser.save((err) => {
        if (err) {
            res.send('Error registering user');
        } else {
            res.send('User registered successfully');
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
