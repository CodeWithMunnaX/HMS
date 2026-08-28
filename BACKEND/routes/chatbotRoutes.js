const express = require('express');
const router = express.Router();
const { processChatQuery } = require('../controllers/chatbotController');

router.post('/query', processChatQuery);

module.exports = router;
