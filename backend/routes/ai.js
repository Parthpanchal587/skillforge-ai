const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, getLessonsByCourseId, chatWithAI, streamChatWithAI } = require('../controllers/aiController');

// AI and course routes
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.get('/courses/:id/lessons', getLessonsByCourseId);
router.post('/chat', chatWithAI);
router.post('/chat/stream', streamChatWithAI);

module.exports = router;