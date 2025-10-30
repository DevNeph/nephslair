const { Poll, PollOption, PollVote, Post, User, Project } = require('../models');
const sequelize = require('../config/database');

// Helper function to format poll options
const formatPollOptions = async (options, userId = null) => {
  if (!userId) {
    return options.map(opt => ({
      id: opt.id,
      option_text: opt.option_text,
      vote_count: opt.votes_count,
      user_has_voted: false
    }));
  }

  const optionIds = options.map(opt => opt.id);
  const userVotes = await PollVote.findAll({
    where: {
      user_id: userId,
      poll_option_id: optionIds
    },
    attributes: ['poll_option_id']
  });

  const votedOptionIds = new Set(userVotes.map(v => v.poll_option_id));

  return options.map(opt => ({
    id: opt.id,
    option_text: opt.option_text,
    vote_count: opt.votes_count,
    user_has_voted: votedOptionIds.has(opt.id)
  }));
};

// ✅ Helper function to auto-finalize expired polls
const checkAndFinalizePoll = async (poll) => {
  if (poll.is_finalized) return poll;
  
  const now = new Date();
  if (poll.end_date && new Date(poll.end_date) < now) {
    poll.is_finalized = true;
    poll.is_active = false;
    poll.finalized_at = new Date();
    await poll.save();
  }
  
  return poll;
};

// @desc    Get poll with options and vote counts
// @route   GET /api/polls/:id
// @access  Public
const getPoll = async (req, res) => {
  try {
    const userId = req.user?.id;

    let poll = await Poll.findByPk(req.params.id, {
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

    // ✅ Auto-finalize if expired
    poll = await checkAndFinalizePoll(poll);

    const now = new Date();
    const isClosed = poll.is_finalized || 
                     !poll.is_active || 
                     (poll.end_date && new Date(poll.end_date) < now);

    const formattedOptions = await formatPollOptions(poll.options, userId);

    res.status(200).json({
      success: true,
      data: {
        ...poll.toJSON(),
        options: formattedOptions,
        is_closed: isClosed
      }
    });
  } catch (error) {
    console.error('Error getting poll:', error);
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
    const userId = req.user?.id;
    
    let project;
    if (isNaN(projectIdOrSlug)) {
      project = await Project.findOne({ where: { slug: projectIdOrSlug } });
    } else {
      project = await Project.findByPk(projectIdOrSlug);
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let polls = await Poll.findAll({
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

    // ✅ Auto-finalize expired polls
    polls = await Promise.all(polls.map(poll => checkAndFinalizePoll(poll)));

    const formattedPolls = await Promise.all(
      polls.map(async (poll) => {
        const now = new Date();
        const isClosed = poll.is_finalized || 
                        !poll.is_active || 
                        (poll.end_date && new Date(poll.end_date) < now);
        
        return {
          ...poll.toJSON(),
          options: await formatPollOptions(poll.options, userId),
          is_closed: isClosed
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedPolls
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
    const userId = req.user?.id;

    let polls = await Poll.findAll({
      where: {
        post_id: req.params.postId,
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

    // ✅ Auto-finalize expired polls
    polls = await Promise.all(polls.map(poll => checkAndFinalizePoll(poll)));

    const formattedPolls = await Promise.all(
      polls.map(async (poll) => {
        const now = new Date();
        const isClosed = poll.is_finalized || 
                        !poll.is_active || 
                        (poll.end_date && new Date(poll.end_date) < now);
        
        return {
          ...poll.toJSON(),
          options: await formatPollOptions(poll.options, userId),
          is_closed: isClosed
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedPolls
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
    const userId = req.user?.id;

    let polls = await Poll.findAll({
      where: {
        show_on_homepage: true,
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

    // ✅ Auto-finalize expired polls
    polls = await Promise.all(polls.map(poll => checkAndFinalizePoll(poll)));

    const formattedPolls = await Promise.all(
      polls.map(async (poll) => {
        const now = new Date();
        const isClosed = poll.is_finalized || 
                        !poll.is_active || 
                        (poll.end_date && new Date(poll.end_date) < now);
        
        return {
          ...poll.toJSON(),
          options: await formatPollOptions(poll.options, userId),
          is_closed: isClosed
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedPolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all standalone polls (for post editor)
// @route   GET /api/polls/available
// @access  Private/Admin
const getAvailablePolls = async (req, res) => {
  try {
    const polls = await Poll.findAll({
      where: {
        is_standalone: true,
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

    // Admin panel doesn't need user_has_voted or auto-finalize
    const formattedPolls = polls.map(poll => ({
      ...poll.toJSON(),
      options: poll.options.map(opt => ({
        id: opt.id,
        option_text: opt.option_text,
        vote_count: opt.votes_count
      }))
    }));

    res.status(200).json({
      success: true,
      data: formattedPolls
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

    // Admin doesn't need user_has_voted
    const formattedPolls = polls.map(poll => ({
      ...poll.toJSON(),
      options: poll.options.map(opt => ({
        id: opt.id,
        option_text: opt.option_text,
        vote_count: opt.votes_count
      }))
    }));

    res.status(200).json({
      success: true,
      data: formattedPolls
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
    const { project_id, question, options, is_active, end_date, show_on_homepage, is_standalone } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide question and at least 2 options'
      });
    }

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

    const poll = await Poll.create({
      project_id: project_id || null,
      question,
      show_on_homepage: show_on_homepage || false,
      is_standalone: is_standalone !== undefined ? is_standalone : true,
      is_active: is_active !== undefined ? is_active : true,
      end_date: end_date || null
    }, { transaction });

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
        options: pollOptions.map(opt => ({
          id: opt.id,
          option_text: opt.option_text,
          vote_count: opt.votes_count
        }))
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

    if (!poll_option_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide poll_option_id'
      });
    }

    let poll = await Poll.findByPk(req.params.id);
    if (!poll) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // ✅ Auto-finalize if expired
    poll = await checkAndFinalizePoll(poll);

    // ✅ Check if finalized
    if (poll.is_finalized) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This poll has been finalized and is no longer accepting votes'
      });
    }

    if (!poll.is_active) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Poll is not active'
      });
    }

    const option = await PollOption.findByPk(poll_option_id);
    if (!option || option.poll_id !== poll.id) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Poll option not found'
      });
    }

    const existingVote = await PollVote.findOne({
      where: {
        poll_id: poll.id,
        user_id: req.user.id
      }
    });

    if (existingVote) {
      if (existingVote.poll_option_id === poll_option_id) {
        await existingVote.destroy({ transaction });
        option.votes_count = Math.max(0, option.votes_count - 1);
        await option.save({ transaction });
        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: 'Vote removed',
          data: { poll_option_id: null }
        });
      }

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

// @desc    Update poll
// @route   PUT /api/polls/:id
// @access  Private/Admin
const updatePoll = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { question, options, is_active, end_date, show_on_homepage, is_standalone, project_id } = req.body;

    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide question and at least 2 options'
      });
    }

    poll.question = question;
    poll.show_on_homepage = show_on_homepage || false;
    poll.is_standalone = is_standalone !== undefined ? is_standalone : true;
    poll.is_active = is_active !== undefined ? is_active : true;
    poll.project_id = project_id || null;
    poll.end_date = end_date || null;
    
    await poll.save({ transaction });

    await PollOption.destroy({
      where: { poll_id: poll.id },
      transaction
    });

    await PollVote.destroy({
      where: { poll_id: poll.id },
      transaction
    });

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

    res.status(200).json({
      success: true,
      message: 'Poll updated successfully',
      data: {
        ...poll.toJSON(),
        options: pollOptions.map(opt => ({
          id: opt.id,
          option_text: opt.option_text,
          vote_count: opt.votes_count
        }))
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
  getPollsByProject,
  getPollsByPost,
  getStandalonePolls,
  getAvailablePolls,
  createPoll,
  updatePoll,
  votePoll,
  getMyPollVote,
  getAllPolls,
  togglePollStatus,
  finalizePoll,
  deletePoll,
  formatPollOptions,
  checkAndFinalizePoll // ✅ Export et (postController için)
};