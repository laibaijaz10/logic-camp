'use strict';

/**
 * Remove Statuses Table and standardize JSON-based statuses
 * - Drops FK columns added for normalized statuses (status_id)
 * - Ensures JSON `statuses` and string `status_title` columns exist on entities
 * - Drops the `statuses` table entirely
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Helper to safely remove a column if it exists
      const removeIfExists = async (table, column) => {
        const tableDesc = await queryInterface.describeTable(table);
        if (tableDesc[column]) {
          await queryInterface.removeColumn(table, column, { transaction: t });
        }
      };

      // 1) Projects: remove status_id, ensure statuses + status_title
      await removeIfExists('projects', 'status_id');
      const projectsDesc = await queryInterface.describeTable('projects');
      if (!projectsDesc['statuses']) {
        await queryInterface.addColumn('projects', 'statuses', {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'JSON array of status objects with title, description, and color'
        }, { transaction: t });
      }
      if (!projectsDesc['status_title']) {
        await queryInterface.addColumn('projects', 'status_title', {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'todo',
          comment: 'Current status title'
        }, { transaction: t });
      }

      // 2) Tasks: remove status_id, ensure statuses + status_title (time columns stay)
      await removeIfExists('tasks', 'status_id');
      const tasksDesc = await queryInterface.describeTable('tasks');
      if (!tasksDesc['statuses']) {
        await queryInterface.addColumn('tasks', 'statuses', {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'JSON array of status objects with title, description, and color'
        }, { transaction: t });
      }
      if (!tasksDesc['status_title']) {
        await queryInterface.addColumn('tasks', 'status_title', {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'todo',
          comment: 'Current status title'
        }, { transaction: t });
      }

      // 4) Drop statuses table if it exists
      // Not all dialects support IF EXISTS on dropTable; check via describe
      try {
        await queryInterface.describeTable('statuses');
        await queryInterface.dropTable('statuses', { transaction: t });
      } catch (e) {
        // Table does not exist; ignore
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Non-destructive down: we won't recreate the old schema fully.
    // Recreate a minimal statuses table to keep migration symmetry if needed.
    await queryInterface.sequelize.transaction(async (t) => {
      // Best-effort recreate statuses table (optional usage)
      await queryInterface.createTable('statuses', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        color: { type: Sequelize.STRING(7), allowNull: false, defaultValue: '#6B7280' },
        is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      }, { transaction: t });

      // Do not re-add status_id columns automatically to avoid data loss/mismatch
    });
  }
};


