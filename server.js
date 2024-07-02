const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;  // Port configuration for Render

// Middleware
app.use(cors({
  origin: '*',  // Temporarily allow all origins; update this later for security
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type',
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI);
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas and Models
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
});
const Todo = mongoose.model('Todo', todoSchema);

// API Routes
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTodo = new Todo({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Failed to create todo item:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await Todo.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = req.params.id;
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (error) {
    console.error('Failed to update todo item:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Todo.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete todo item:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove static file serving and wildcard route for frontend
// Commented out as it's not needed
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client', 'build')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
