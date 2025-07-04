const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

router.get('/', async (req, res) => {
  const { room = 'global', page = 1, limit = 20 } = req.query;
  const messages = await Message.find({ room })
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(messages.reverse());
});

module.exports = router;
