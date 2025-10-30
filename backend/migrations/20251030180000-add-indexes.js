'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to safely add index (skip if exists)
    const addIndexIfNotExists = async (table, columns, options = {}) => {
      try {
        await queryInterface.addIndex(table, columns, options);
      } catch (error) {
        // Ignore duplicate key errors
        if (error.name === 'SequelizeDatabaseError' && error.message && error.message.includes('Duplicate key name')) {
          console.log(`⚠️  Index on ${table}(${columns.join(', ')}) already exists, skipping...`);
        } else {
          throw error;
        }
      }
    };

    // posts (check if FK already created index)
    await addIndexIfNotExists('posts', ['project_id']);
    await addIndexIfNotExists('posts', ['author_id']);
    await addIndexIfNotExists('posts', ['status']);
    await addIndexIfNotExists('posts', ['published_at']);

    // polls
    await addIndexIfNotExists('polls', ['project_id']);
    await addIndexIfNotExists('polls', ['post_id']);
    await addIndexIfNotExists('polls', ['is_active']);
    await addIndexIfNotExists('polls', ['show_on_homepage']);
    await addIndexIfNotExists('polls', ['end_date']);

    // poll_options
    await addIndexIfNotExists('poll_options', ['poll_id']);

    // poll_votes
    await addIndexIfNotExists('poll_votes', ['poll_option_id']);
    // ensure unique (poll_id, user_id)
    await addIndexIfNotExists('poll_votes', ['poll_id', 'user_id'], { unique: true, name: 'poll_votes_poll_user_unique' });

    // releases
    await addIndexIfNotExists('releases', ['project_id']);
    await addIndexIfNotExists('releases', ['is_published']);
    await addIndexIfNotExists('releases', ['release_date']);

    // release_files
    await addIndexIfNotExists('release_files', ['release_id']);

    // changelogs
    await addIndexIfNotExists('changelogs', ['project_id']);
    await addIndexIfNotExists('changelogs', ['release_date']);

    // post_polls
    await addIndexIfNotExists('post_polls', ['post_id']);
    await addIndexIfNotExists('post_polls', ['poll_id']);
    await addIndexIfNotExists('post_polls', ['post_id', 'poll_id'], { unique: true, name: 'unique_post_poll' });

    // post_releases - REMOVED: 'unique_post_release' already created in create-post-releases.js migration
    // Only add simple indexes, NOT the unique constraint
    await addIndexIfNotExists('post_releases', ['post_id']);
    await addIndexIfNotExists('post_releases', ['release_id']);
    // unique_post_release constraint is already created in 20251030150621-create-post-releases.js

    // comment_votes - REMOVED: 'unique_user_comment_vote' already created in create-comment-vote.js migration
    // Only add simple indexes, NOT the unique constraint
    await addIndexIfNotExists('comment_votes', ['user_id']);
    await addIndexIfNotExists('comment_votes', ['comment_id']);
    // unique_user_comment_vote constraint is already created in 20251027221331-create-comment-vote.js
  },

  async down(queryInterface, Sequelize) {
    // Reverse order
    // comment_votes - Only remove simple indexes, keep unique constraint as it was created in another migration
    await queryInterface.removeIndex('comment_votes', ['comment_id']).catch(() => {});
    await queryInterface.removeIndex('comment_votes', ['user_id']).catch(() => {});

    // post_releases - Only remove simple indexes, keep unique constraint as it was created in another migration
    await queryInterface.removeIndex('post_releases', ['release_id']).catch(() => {});
    await queryInterface.removeIndex('post_releases', ['post_id']).catch(() => {});

    await queryInterface.removeIndex('post_polls', 'unique_post_poll').catch(() => {});
    await queryInterface.removeIndex('post_polls', ['poll_id']).catch(() => {});
    await queryInterface.removeIndex('post_polls', ['post_id']).catch(() => {});

    await queryInterface.removeIndex('changelogs', ['release_date']).catch(() => {});
    await queryInterface.removeIndex('changelogs', ['project_id']).catch(() => {});

    await queryInterface.removeIndex('release_files', ['release_id']).catch(() => {});

    await queryInterface.removeIndex('releases', ['release_date']).catch(() => {});
    await queryInterface.removeIndex('releases', ['is_published']).catch(() => {});
    await queryInterface.removeIndex('releases', ['project_id']).catch(() => {});

    await queryInterface.removeIndex('poll_votes', 'poll_votes_poll_user_unique').catch(() => {});
    await queryInterface.removeIndex('poll_votes', ['poll_option_id']).catch(() => {});

    await queryInterface.removeIndex('poll_options', ['poll_id']).catch(() => {});

    await queryInterface.removeIndex('polls', ['end_date']).catch(() => {});
    await queryInterface.removeIndex('polls', ['show_on_homepage']).catch(() => {});
    await queryInterface.removeIndex('polls', ['is_active']).catch(() => {});
    await queryInterface.removeIndex('polls', ['post_id']).catch(() => {});
    await queryInterface.removeIndex('polls', ['project_id']).catch(() => {});

    await queryInterface.removeIndex('posts', ['published_at']).catch(() => {});
    await queryInterface.removeIndex('posts', ['status']).catch(() => {});
    await queryInterface.removeIndex('posts', ['author_id']).catch(() => {});
    await queryInterface.removeIndex('posts', ['project_id']).catch(() => {});
  }
};
