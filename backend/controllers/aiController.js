const axios = require('axios');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const { DataTypes } = require('sequelize');

// Define models
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
  },
  instructor: {
    type: DataTypes.STRING,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'courses',
  timestamps: true
});

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
  },
  videoUrl: {
    type: DataTypes.STRING,
  },
  order: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'lessons',
  timestamps: true
});

// Sync models
sequelize.sync();

exports.getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let where = {};

    if (category) where.category = category;
    if (level) where.level = level;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const courses = await Course.findAll({ where });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      include: [{ model: Lesson, as: 'lessons' }]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLessonsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    });
    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message, model = 'llama2' } = req.body;

    // Forward request to Ollama API
    const ollamaResponse = await axios.post(
      `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`,
      {
        model,
        prompt: message,
        stream: false
      }
    );

    res.json({ response: ollamaResponse.data.response });
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500).json({
      message: 'Error communicating with AI service',
      error: error.message
    });
  }
};

exports.streamChatWithAI = async (req, res) => {
  try {
    const { message, model = 'llama2' } = req.body;

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Forward streaming request to Ollama
    const ollamaResponse = await axios.post(
      `${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`,
      {
        model,
        prompt: message,
        stream: true
      },
      {
        responseType: 'stream'
      }
    );

    // Pipe the response
    ollamaResponse.data.on('data', (chunk) => {
      const data = chunk.toString();
      try {
        const parsed = JSON.parse(data);
        if (parsed.response) {
          res.write(`data: ${JSON.stringify({ response: parsed.response })}\n\n`);
        }
        if (parsed.done) {
          res.write('data: [DONE]\n\n');
          res.end();
        }
      } catch (e) {
        // Silently skip malformed chunks
      }
    });

    ollamaResponse.data.on('error', (err) => {
      console.error('Ollama stream error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Error setting up AI stream:', error);
    res.status(500).json({
      message: 'Error setting up AI service',
      error: error.message
    });
  }
};