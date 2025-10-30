const express = require('express');
const router = express.Router();
const { getUserVote } = require('../controllers/voteController');
const { votePost: votePostOnPost } = require('../controllers/postController');
const auth = require('../middleware/auth');

// Keep /votes as a thin proxy to canonical /posts/:id/vote logic to avoid duplicate business rules
router.post('/', auth, (req, res, next) => {
  // Map body.post_id -> params.id for reuse
  req.params.id = req.body.post_id;
  return votePostOnPost(req, res, next);
});

router.get('/post/:postId', auth, getUserVote);

module.exports = router;