'use strict';

/**
 * Add Entity-Specific Statuses
 * Description: Add entity_type field to statuses table to allow different statuses for projects, tasks, and global entries
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Add entity_type column to statuses table
      await queryInterface.addColumn('statuses', 'entity_type', {
        type: Sequelize.ENUM('project', 'task', 'global'),
        allowNull: false,
        defaultValue: 'global',
      }, { transaction: t });

      // Create index for entity_type
      await queryInterface.addIndex('statuses', ['entity_type'], { transaction: t });

      // Update existing statuses to be global by default
      await queryInterface.sequelize.query(`
        UPDATE statuses 
        SET entity_type = 'global'
        WHERE entity_type IS NULL
      `, { transaction: t });

      // Create entity-specific statuses
      const entityStatuses = [
        // Project statuses
        { name: 'planning', description: 'Project is in planning phase', color: '#6B7280', is_default: true, entity_type: 'project' },
        { name: 'active', description: 'Project is actively being worked on', color: '#3B82F6', is_default: true, entity_type: 'project' },
        { name: 'on-hold', description: 'Project is temporarily paused', color: '#F59E0B', is_default: true, entity_type: 'project' },
        { name: 'completed', description: 'Project has been completed', color: '#10B981', is_default: true, entity_type: 'project' },
        { name: 'cancelled', description: 'Project has been cancelled', color: '#EF4444', is_default: true, entity_type: 'project' },

        // Task statuses
        { name: 'todo', description: 'Task is pending', color: '#6B7280', is_default: true, entity_type: 'task' },
        { name: 'in-progress', description: 'Task is being worked on', color: '#3B82F6', is_default: true, entity_type: 'task' },
        { name: 'testing', description: 'Task is being tested', color: '#F59E0B', is_default: true, entity_type: 'task' },
        { name: 'review', description: 'Task is under review', color: '#8B5CF6', is_default: true, entity_type: 'task' },
        { name: 'done', description: 'Task is completed', color: '#10B981', is_default: true, entity_type: 'task' },
      ];

      // Insert entity-specific statuses (only if they don't exist)
      for (const status of entityStatuses) {
        const [existingStatus] = await queryInterface.sequelize.query(
          `SELECT id FROM statuses WHERE name = :name AND entity_type = :entity_type`,
          {
            replacements: { name: status.name, entity_type: status.entity_type },
            type: queryInterface.sequelize.QueryTypes.SELECT,
            transaction: t
          }
        );

        if (!existingStatus) {
          await queryInterface.bulkInsert('statuses', [{
            ...status,
            created_at: new Date(),
            updated_at: new Date(),
          }], { transaction: t });
        }
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Remove entity-specific statuses
      await queryInterface.sequelize.query(`
        DELETE FROM statuses 
        WHERE entity_type != 'global'
      `, { transaction: t });

      // Remove entity_type column
      await queryInterface.removeColumn('statuses', 'entity_type', { transaction: t });
    });
  }
};
