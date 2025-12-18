'use strict';

/**
 * Create Status Table
 * Description: Creates the statuses table with default statuses for projects and tasks
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Create statuses table
      await queryInterface.createTable('statuses', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        color: {
          type: Sequelize.STRING(7),
          allowNull: false,
          defaultValue: '#6B7280',
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction: t });

      // Create indexes
      await queryInterface.addIndex('statuses', ['name'], { transaction: t });
      await queryInterface.addIndex('statuses', ['is_default'], { transaction: t });
      await queryInterface.addIndex('statuses', ['created_by'], { transaction: t });

      // Insert default statuses
      await queryInterface.bulkInsert('statuses', [
        {
          name: 'todo',
          description: 'Task or project is pending',
          color: '#6B7280',
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'inProgress',
          description: 'Task or project is in progress',
          color: '#3B82F6',
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'testing',
          description: 'Task or project is being tested',
          color: '#F59E0B',
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'review',
          description: 'Task or project is under review',
          color: '#8B5CF6',
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'done',
          description: 'Task or project is completed',
          color: '#10B981',
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ], { transaction: t });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Drop the statuses table
      await queryInterface.dropTable('statuses', { transaction: t });
    });
  }
};
