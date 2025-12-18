'use strict';

/**
 * Align database schema to Logiccamp Database.txt specification.
 * - users: add notifications JSON, remove is_active, use underscored timestamps
 * - teams: drop is_active, allow NULL team_lead_id, add index
 * - projects: files JSON, start_date/end_date DATEONLY, FKs and indexes, underscored
 * - tasks: drop priority/created_by_id/estimates, assigned_to_id nullable, deadline DATEONLY, underscored
 * - task_comments: files JSON, underscored
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // USERS
    await queryInterface.sequelize.transaction(async (t) => {
      const qi = queryInterface;
      // add notifications if not exists
      await qi.addColumn('users', 'notifications', { type: Sequelize.JSON, allowNull: true }, { transaction: t }).catch(() => {});
      // remove is_active if exists
      await qi.removeColumn('users', 'is_active', { transaction: t }).catch(() => {});
      // ensure is_approved exists with default false
      await qi.changeColumn('users', 'is_approved', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }, { transaction: t }).catch(() => {});
    });

    // TEAMS
    await queryInterface.sequelize.transaction(async (t) => {
      const qi = queryInterface;
      await qi.removeColumn('teams', 'is_active', { transaction: t }).catch(() => {});
      await qi.changeColumn('teams', 'team_lead_id', { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' }, { transaction: t }).catch(() => {});
      // add index on team_lead_id
      await qi.addIndex('teams', ['team_lead_id'], { transaction: t }).catch(() => {});
    });

    // PROJECTS
    await queryInterface.sequelize.transaction(async (t) => {
      const qi = queryInterface;
      await qi.changeColumn('projects', 'files', { type: Sequelize.JSON, allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('projects', 'start_date', { type: Sequelize.DATEONLY, allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('projects', 'end_date', { type: Sequelize.DATEONLY, allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('projects', 'team_id', { type: Sequelize.INTEGER, allowNull: false, references: { model: 'teams', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' }, { transaction: t }).catch(() => {});
      await qi.changeColumn('projects', 'owner_id', { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' }, { transaction: t }).catch(() => {});
    });

    // TASKS
    await queryInterface.sequelize.transaction(async (t) => {
      const qi = queryInterface;
      await qi.removeColumn('tasks', 'priority', { transaction: t }).catch(() => {});
      await qi.removeColumn('tasks', 'created_by_id', { transaction: t }).catch(() => {});
      await qi.removeColumn('tasks', 'estimated_hours', { transaction: t }).catch(() => {});
      await qi.removeColumn('tasks', 'actual_hours', { transaction: t }).catch(() => {});
      await qi.changeColumn('tasks', 'deadline', { type: Sequelize.DATEONLY, allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('tasks', 'assigned_to_id', { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' }, { transaction: t }).catch(() => {});
    });

    // TASK COMMENTS
    await queryInterface.sequelize.transaction(async (t) => {
      const qi = queryInterface;
      await qi.changeColumn('task_comments', 'files', { type: Sequelize.JSON, allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('task_comments', 'task_id', { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tasks', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' }, { transaction: t }).catch(() => {});
      await qi.changeColumn('task_comments', 'user_id', { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' }, { transaction: t }).catch(() => {});
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Best-effort reversal to previous state
    await queryInterface.sequelize.transaction(async (t) => {
      const qi = queryInterface;
      // users
      await qi.removeColumn('users', 'notifications', { transaction: t }).catch(() => {});
      await qi.addColumn('users', 'is_active', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }, { transaction: t }).catch(() => {});
      // teams
      await qi.addColumn('teams', 'is_active', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }, { transaction: t }).catch(() => {});
      // projects
      await qi.changeColumn('projects', 'files', { type: Sequelize.TEXT, allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('projects', 'start_date', { type: Sequelize.DATE, allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('projects', 'end_date', { type: Sequelize.DATE, allowNull: true }, { transaction: t }).catch(() => {});
      // tasks
      await qi.addColumn('tasks', 'priority', { type: Sequelize.ENUM('low','medium','high','urgent'), allowNull: false, defaultValue: 'medium' }, { transaction: t }).catch(() => {});
      await qi.addColumn('tasks', 'created_by_id', { type: Sequelize.INTEGER, allowNull: false }, { transaction: t }).catch(() => {});
      await qi.addColumn('tasks', 'estimated_hours', { type: Sequelize.DECIMAL(5,2), allowNull: true }, { transaction: t }).catch(() => {});
      await qi.addColumn('tasks', 'actual_hours', { type: Sequelize.DECIMAL(5,2), allowNull: true }, { transaction: t }).catch(() => {});
      await qi.changeColumn('tasks', 'deadline', { type: Sequelize.DATE, allowNull: true }, { transaction: t }).catch(() => {});
      // task_comments
      await qi.changeColumn('task_comments', 'files', { type: Sequelize.TEXT, allowNull: true }, { transaction: t }).catch(() => {});
    });
  }
};


