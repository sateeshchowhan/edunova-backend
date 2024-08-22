const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Mock user data
let users = [
  { id: 1, name: 'Olivia Rhye', username: '@olivia', status: 'Active', role: 'Product Designer', email: 'olivia@untitledui.com', teams: ['Design', 'Product', 'Marketing'], photoUrl: '' },
  // Add more users as needed
];

// Generate a new unique ID for a user
const generateUserId = () => {
  return users.length ? Math.max(...users.map(user => user.id)) + 1 : 1;
};

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Get a single user by ID
app.get('/api/users/:id', (req, res) => {
  console.log("User ID received in the request:", req.params.id); // Debugging log
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

// Add a new user
app.post('/api/users', upload.single('photo'), (req, res) => {
  const newUser = {
    id: generateUserId(),
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    status: req.body.status,
    teams: JSON.parse(req.body.teams),
    photoUrl: req.file ? `/uploads/${req.file.filename}` : ''
  };
  users.push(newUser);
  res.json(newUser);
});

// Update an existing user with file upload
app.put('/api/users/:id', upload.single('photo'), (req, res) => {
  console.log("Updating user ID:", req.params.id); // Debugging log
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');

  // If there's an existing photo and a new one is uploaded, delete the old one
  if (user.photoUrl && req.file) {
    const oldPhotoPath = path.join(__dirname, user.photoUrl);
    if (fs.existsSync(oldPhotoPath)) {
      fs.unlinkSync(oldPhotoPath); // Delete the old file
    }
  }

  user.name = req.body.name;
  user.email = req.body.email;
  user.role = req.body.role;
  user.status = req.body.status;
  user.teams = JSON.parse(req.body.teams);
  if (req.file) {
    user.photoUrl = `/uploads/${req.file.filename}`;
  }

  res.json(user);
});

// Delete a user
app.delete('/api/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).send('User not found');

  const user = users[userIndex];
  if (user.photoUrl) {
    const photoPath = path.join(__dirname, user.photoUrl);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath); // Delete the associated file
    }
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
