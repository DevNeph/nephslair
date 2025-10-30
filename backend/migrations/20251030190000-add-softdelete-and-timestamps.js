'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const addColumnSafe = async (table, column, definition) => {
      try { await queryInterface.addColumn(table, column, definition); } catch (_) {}
    };
    const changeColumnSafe = async (table, column, definition) => {
      try { await queryInterface.changeColumn(table, column, definition); } catch (_) {}
    };

    // posts
    await addColumnSafe('posts', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
    await changeColumnSafe('posts', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });
    await changeColumnSafe('posts', 'updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });

    // projects
    await addColumnSafe('projects', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
    await changeColumnSafe('projects', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });
    await changeColumnSafe('projects', 'updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });

    // polls
    await addColumnSafe('polls', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
    await changeColumnSafe('polls', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });

    // poll_options
    await addColumnSafe('poll_options', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
    await changeColumnSafe('poll_options', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });

    // poll_votes
    await addColumnSafe('poll_votes', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
    await changeColumnSafe('poll_votes', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });

    // releases
    await addColumnSafe('releases', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
    await changeColumnSafe('releases', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });
    await changeColumnSafe('releases', 'updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });

    // release_files
    await addColumnSafe('release_files', 'deleted_at', { type: Sequelize.DATE, allowNull: true });

    // changelogs
    await addColumnSafe('changelogs', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
    await changeColumnSafe('changelogs', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });
    await changeColumnSafe('changelogs', 'updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') });

    // post_polls
    await addColumnSafe('post_polls', 'deleted_at', { type: Sequelize.DATE, allowNull: true });

    // post_releases
    await addColumnSafe('post_releases', 'deleted_at', { type: Sequelize.DATE, allowNull: true });

    // comment_votes
    await addColumnSafe('comment_votes', 'deleted_at', { type: Sequelize.DATE, allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    const removeColumnSafe = async (table, column) => { try { await queryInterface.removeColumn(table, column); } catch (_) {} };

    await removeColumnSafe('posts', 'deleted_at');
    await removeColumnSafe('projects', 'deleted_at');
    await removeColumnSafe('polls', 'deleted_at');
    await removeColumnSafe('poll_options', 'deleted_at');
    await removeColumnSafe('poll_votes', 'deleted_at');
    await removeColumnSafe('releases', 'deleted_at');
    await removeColumnSafe('release_files', 'deleted_at');
    await removeColumnSafe('changelogs', 'deleted_at');
    await removeColumnSafe('post_polls', 'deleted_at');
    await removeColumnSafe('post_releases', 'deleted_at');
    await removeColumnSafe('comment_votes', 'deleted_at');
  }
};
