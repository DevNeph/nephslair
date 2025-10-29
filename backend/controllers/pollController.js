const { Poll, PollOption, PollVote, Post, User, Project } = require('../models');
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

// @desc    Get polls by project
// @route   GET /api/polls/project/:projectIdOrSlug
// @access  Public
const getPollsByProject = async (req, res) => {
  try {
    const { projectIdOrSlug } = req.params;
    
    // Try to find project by ID or slug
    let project;
    if (isNaN(projectIdOrSlug)) {
      // It's a slug
      project = await Project.findOne({ where: { slug: projectIdOrSlug } });
    } else {
      // It's an ID
      project = await Project.findByPk(projectIdOrSlug);
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const polls = await Poll.findAll({
      where: {
        project_id: project.id,
        is_active: true
      },
      include: [
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'option_text', 'votes_count']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: polls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get polls by post
// @route   GET /api/polls/post/:postId
// @access  Public
const getPollsByPost = async (req, res) => {
  try {
    const polls = await Poll.findAll({
      where: {
        post_id: req.params.postId,
        placement_type: ['post', 'both'],
        is_active: true
      },
      include: [
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'option_text', 'votes_count']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: polls
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
    const { project_id, post_id, question, options, placement_type, is_active, end_date } = req.body;

    // Validation
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide question and at least 2 options'
      });
    }

    // Validate placement type
    const validPlacements = ['project', 'post', 'both', 'standalone'];
    if (placement_type && !validPlacements.includes(placement_type)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid placement type'
      });
    }

    // Check if project exists (if provided)
    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Check if post exists (if provided)
    if (post_id) {
      const post = await Post.findByPk(post_id);
      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
    }

    // Create poll
    const poll = await Poll.create({
      project_id: project_id || null,
      post_id: post_id || null,
      question,
      placement_type: placement_type || 'standalone',
      is_active: is_active !== undefined ? is_active : true,
      end_date: end_date || null
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

// @desc    Vote on poll (with toggle functionality)
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
      // If voting for same option, REMOVE vote (toggle)
      if (existingVote.poll_option_id === poll_option_id) {
        await existingVote.destroy({ transaction });

        // Decrease vote count
        option.votes_count = Math.max(0, option.votes_count - 1);
        await option.save({ transaction });

        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: 'Vote removed',
          data: { poll_option_id: null }
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

// @desc    Get all polls (Admin)
// @route   GET /api/polls/admin/all
// @access  Private/Admin
const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.findAll({
      include: [
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'option_text', 'votes_count']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: polls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle poll active status
// @route   PATCH /api/polls/:id/toggle
// @access  Private/Admin
const togglePollStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Cannot reactivate finalized polls
    if (poll.is_finalized && is_active) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reactivate a finalized poll'
      });
    }

    poll.is_active = is_active;
    await poll.save();

    res.status(200).json({
      success: true,
      message: `Poll ${is_active ? 'activated' : 'deactivated'} successfully`,
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

// @desc    Get standalone polls (for homepage)
// @route   GET /api/polls/standalone
// @access  Public
const getStandalonePolls = async (req, res) => {
  try {
    const polls = await Poll.findAll({
      where: {
        placement_type: 'standalone',
        is_active: true
      },
      include: [
        {
          model: PollOption,
          as: 'options',
          attributes: ['id', 'option_text', 'votes_count']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: polls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Finalize poll (cannot be reopened)
// @route   PATCH /api/polls/:id/finalize
// @access  Private/Admin
const finalizePoll = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    if (poll.is_finalized) {
      return res.status(400).json({
        success: false,
        message: 'Poll is already finalized'
      });
    }

    poll.is_finalized = true;
    poll.is_active = false;
    poll.finalized_at = new Date();
    await poll.save();

    res.status(200).json({
      success: true,
      message: 'Poll finalized successfully',
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

module.exports = {
  getPoll,
  getPollsByProject,
  getPollsByPost,
  getStandalonePolls,
  createPoll,
  votePoll,
  getMyPollVote,
  getAllPolls,
  togglePollStatus,
  finalizePoll,
  deletePoll
};