const { Poll, PollOption, PollVote, Post, User, Project } = require('../models');
const sequelize = require('../config/database');
const { validateFields } = require('../utils/validate');
const { success, error } = require('../utils/response');

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
      return error(res, 'Poll not found', 404);
    }

    // ✅ Auto-finalize if expired
    poll = await checkAndFinalizePoll(poll);

    const now = new Date();
    const isClosed = poll.is_finalized || 
                     !poll.is_active || 
                     (poll.end_date && new Date(poll.end_date) < now);

    const formattedOptions = await formatPollOptions(poll.options, userId);

    return success(res, {
      ...poll.toJSON(),
      options: formattedOptions,
      is_closed: isClosed
    });
  } catch (err) {
    console.error('Error getting poll:', err);
    return error(res, 'Server error', 500, err.message);
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
      return error(res, 'Project not found', 404);
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

    return success(res, formattedPolls);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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

    return success(res, formattedPolls);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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

    return success(res, formattedPolls);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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

    return success(res, formattedPolls);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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

    return success(res, formattedPolls);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Create poll with options
// @route   POST /api/polls
// @access  Private/Admin
const createPoll = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { project_id, question, options, is_active, end_date, show_on_homepage, is_standalone } = req.body;
    const validationError = validateFields(req.body, ['question', 'options']);
    if (validationError || !Array.isArray(options) || options.length < 2) {
      await transaction.rollback();
      return error(res, 'Please provide question and at least 2 options', 400);
    }
    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) {
        await transaction.rollback();
        return error(res, 'Project not found', 404);
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
      options.map(option => PollOption.create({
        poll_id: poll.id,
        option_text: option,
        votes_count: 0
      }, { transaction }))
    );
    await transaction.commit();
    return success(res, {
      ...poll.toJSON(),
      options: pollOptions.map(opt => ({
        id: opt.id,
        option_text: opt.option_text,
        vote_count: opt.votes_count
      }))
    }, 'Poll created successfully', 201);
  } catch (err) {
    await transaction.rollback();
    return error(res, 'Server error', 500, err.message);
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
      return error(res, 'Please provide poll_option_id', 400);
    }

    let poll = await Poll.findByPk(req.params.id);
    if (!poll) {
      await transaction.rollback();
      return error(res, 'Poll not found', 404);
    }

    // ✅ Auto-finalize if expired
    poll = await checkAndFinalizePoll(poll);

    // ✅ Check if finalized
    if (poll.is_finalized) {
      await transaction.rollback();
      return error(res, 'This poll has been finalized and is no longer accepting votes', 400);
    }

    if (!poll.is_active) {
      await transaction.rollback();
      return error(res, 'Poll is not active', 400);
    }

    const option = await PollOption.findByPk(poll_option_id);
    if (!option || option.poll_id !== poll.id) {
      await transaction.rollback();
      return error(res, 'Poll option not found', 404);
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

        return success(res, { poll_option_id: null }, 'Vote removed', 200);
      }

      const oldOption = await PollOption.findByPk(existingVote.poll_option_id);
      oldOption.votes_count = Math.max(0, oldOption.votes_count - 1);
      await oldOption.save({ transaction });

      existingVote.poll_option_id = poll_option_id;
      await existingVote.save({ transaction });

      option.votes_count += 1;
      await option.save({ transaction });

      await transaction.commit();

      return success(res, { poll_option_id }, 'Vote updated successfully', 200);
    }

    await PollVote.create({
      poll_id: poll.id,
      poll_option_id,
      user_id: req.user.id
    }, { transaction });

    option.votes_count += 1;
    await option.save({ transaction });

    await transaction.commit();

    return success(res, { poll_option_id }, 'Vote created successfully', 201);
  } catch (error) {
    await transaction.rollback();
    return error(res, 'Server error', 500, error.message);
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
      return success(res, { voted: false, poll_option_id: null });
    }

    return success(res, { voted: true, poll_option_id: vote.poll_option_id });
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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
      return error(res, 'Poll not found', 404);
    }

    if (poll.is_finalized && is_active) {
      return error(res, 'Cannot reactivate a finalized poll', 400);
    }

    poll.is_active = is_active;
    await poll.save();

    return success(res, poll, `Poll ${is_active ? 'activated' : 'deactivated'} successfully`, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Finalize poll (cannot be reopened)
// @route   PATCH /api/polls/:id/finalize
// @access  Private/Admin
const finalizePoll = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return error(res, 'Poll not found', 404);
    }

    if (poll.is_finalized) {
      return error(res, 'Poll is already finalized', 400);
    }

    poll.is_finalized = true;
    poll.is_active = false;
    poll.finalized_at = new Date();
    await poll.save();

    return success(res, poll, 'Poll finalized successfully', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Update poll
// @route   PUT /api/polls/:id
// @access  Private/Admin
const updatePoll = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { question, options: incomingOptions, is_active, end_date, show_on_homepage, is_standalone, project_id } = req.body;
    const poll = await Poll.findByPk(req.params.id, { include: [{ model: PollOption, as: 'options' }] });
    if (!poll) {
      await transaction.rollback();
      return error(res, 'Poll not found', 404);
    }
    if (!question || !incomingOptions || !Array.isArray(incomingOptions) || incomingOptions.length < 2) {
      await transaction.rollback();
      return error(res, 'Please provide question and at least 2 options', 400);
    }
    // 1. Mevcut seçeneklerle/request'ten gelenleri eşle (option_text => id bağını korumak için)
    const oldOptions = poll.options;
    const oldOptionsMap = {};
    oldOptions.forEach(opt => { oldOptionsMap[opt.option_text] = opt; });

    // ileri: metni değişmiş fakat aynı id'de korunması gereken seçenekleri güncelle
    for (const [index, text] of incomingOptions.entries()) {
      // Eğer bu option'un id'si varsa ve text'i farklıysa, güncelle
      let matchingOption = oldOptions[index];
      if (matchingOption && matchingOption.option_text !== text) {
        matchingOption.option_text = text;
        await matchingOption.save({ transaction });
      }
    }
    // eski diff kodu korunsun
    const optionsToKeep = incomingOptions.filter(text => !!oldOptionsMap[text]);
    const optionsToAdd = incomingOptions.filter(text => !oldOptionsMap[text]);
    const optionsToDelete = oldOptions.filter(opt => !incomingOptions.includes(opt.option_text));

    // 2. Texti aynı kalanlar aynı şekilde kalır
    // (option_text'leri değişen ama id'si korunacak olanları da güncellemek için)
    for (const opt of oldOptions) {
      // Eğer aynı metin varsa hiç elleme
      if (optionsToKeep.includes(opt.option_text)) continue;
      // Eğer id korunarak text güncellenecekse (gelişmiş diff gerekirdi) — biz sadeleştiriyoruz
    }

    // 3. Yeni eklenenleri oluştur
    const createdOptions = [];
    for (const text of optionsToAdd) {
      createdOptions.push(await PollOption.create({ poll_id: poll.id, option_text: text, votes_count: 0 }, { transaction }));
    }

    // 4. Silinen eski seçeneklerin votes'larını sil, seçeneği de sil
    for (const deletedOpt of optionsToDelete) {
      await PollVote.destroy({ where: { poll_option_id: deletedOpt.id }, transaction });
      await deletedOpt.destroy({ transaction });
    }

    // 5. Poll ana alanlarını güncelle
    poll.question = question;
    poll.show_on_homepage = show_on_homepage || false;
    poll.is_standalone = is_standalone !== undefined ? is_standalone : true;
    poll.is_active = is_active !== undefined ? is_active : true;
    poll.project_id = project_id || null;
    poll.end_date = end_date || null;
    await poll.save({ transaction });

    // 6. Sonuç options listesini votes_count ile hazırla
    const finalOptions = await PollOption.findAll({ where: { poll_id: poll.id }, transaction });

    await transaction.commit();
    return success(res, {
      ...poll.toJSON(),
      options: finalOptions.map(opt => ({
        id: opt.id,
        option_text: opt.option_text,
        votes_count: opt.votes_count
      }))
    }, 'Poll updated successfully', 200);
  } catch (err) {
    await transaction.rollback();
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// @access  Private/Admin
const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return error(res, 'Poll not found', 404);
    }

    await poll.destroy();

    return success(res, null, 'Poll deleted successfully', 204);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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