const { Poll, PollOption, PollVote, Post, User } = require('../models');
const sequelize = require('../config/database');

// @desc    Get poll with options and vote counts
// @route   GET /api/polls/:id
// @access  Public
const getPoll = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id, {
      include: [
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'option_text', 'votes_count']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create poll with options
// @route   POST /api/polls
// @access  Private/Admin
const createPoll = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { post_id, question, options } = req.body;

    // Validation
    if (!post_id || !question || !options || !Array.isArray(options) || options.length < 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide post_id, question and at least 2 options'
      });
    }

    // Check if post exists
    const post = await Post.findByPk(post_id);
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create poll
    const poll = await Poll.create({
      post_id,
      question,
      is_active: true
    }, { transaction });

    // Create poll options
    const pollOptions = await Promise.all(
      options.map(option => 
        PollOption.create({
          poll_id: poll.id,
          option_text: option,
          votes_count: 0
        }, { transaction })
      )
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: {
        ...poll.toJSON(),
        options: pollOptions
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Vote on poll
// @route   POST /api/polls/:id/vote
// @access  Private
const votePoll = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { poll_option_id } = req.body;

    // Validation
    if (!poll_option_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide poll_option_id'
      });
    }

    // Check if poll exists and is active
    const poll = await Poll.findByPk(req.params.id);
    if (!poll) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    if (!poll.is_active) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Poll is not active'
      });
    }

    // Check if option exists and belongs to this poll
    const option = await PollOption.findByPk(poll_option_id);
    if (!option || option.poll_id !== poll.id) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Poll option not found'
      });
    }

    // Check if user already voted
    const existingVote = await PollVote.findOne({
      where: {
        poll_id: poll.id,
        user_id: req.user.id
      }
    });

    if (existingVote) {
      // If voting for same option, return error
      if (existingVote.poll_option_id === poll_option_id) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'You have already voted for this option'
        });
      }

      // Update vote to new option
      const oldOption = await PollOption.findByPk(existingVote.poll_option_id);
      oldOption.votes_count = Math.max(0, oldOption.votes_count - 1);
      await oldOption.save({ transaction });

      existingVote.poll_option_id = poll_option_id;
      await existingVote.save({ transaction });

      option.votes_count += 1;
      await option.save({ transaction });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Vote updated successfully',
        data: { poll_option_id }
      });
    }

    // Create new vote
    await PollVote.create({
      poll_id: poll.id,
      poll_option_id,
      user_id: req.user.id
    }, { transaction });

    option.votes_count += 1;
    await option.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Vote created successfully',
      data: { poll_option_id }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's vote for a poll
// @route   GET /api/polls/:id/my-vote
// @access  Private
const getMyPollVote = async (req, res) => {
  try {
    const vote = await PollVote.findOne({
      where: {
        poll_id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!vote) {
      return res.status(200).json({
        success: true,
        data: { voted: false, poll_option_id: null }
      });
    }

    res.status(200).json({
      success: true,
      data: { voted: true, poll_option_id: vote.poll_option_id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// @access  Private/Admin
const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    await poll.destroy();

    res.status(200).json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
        error: error.message
        });
    }
    };

    module.exports = {
    getPoll,
    createPoll,
    votePoll,
    getMyPollVote,
    deletePoll
    };