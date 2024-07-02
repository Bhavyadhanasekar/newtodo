// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Todo Schema and Model
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const Todo = mongoose.model('Todo', todoSchema);

// Define Routes

// Create a new todo item
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTodo = new Todo({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Unable to create Todo item' });
  }
});

// API endpoint to get items
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Unable to retrieve Todo items' });
  }
});

// Update a todo item
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
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Unable to update Todo item' });
  }
});

// Delete a todo item
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Todo.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Unable to delete Todo item' });
  }
});

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'todo-frontend', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'todo-frontend', 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
