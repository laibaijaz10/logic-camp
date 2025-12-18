import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { notifyTaskAssigned, notifyTaskAssignedToTeam, notifyTaskCompleted } from '../services/notificationService';

export interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  statuses?: Array<{
    id: number;
    title: string;
    description?: string;
    color: string;
  }> | null;
  status_title: string;
  deadline?: Date;
  expected_time: number; // in minutes
  spent_time: number; // in minutes
  project_id: number;
  assigned_to_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'deadline' | 'assigned_to_id' | 'statuses' | 'status_title' | 'expected_time' | 'spent_time'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  // Field declarations for TypeScript
  public id!: number;
  public title!: string;
  public description?: string;
  public statuses?: Array<{
    id: number;
    title: string;
    description?: string;
    color: string;
  }> | null;
  public status_title!: string;
  public deadline?: Date;
  public expected_time!: number;
  public spent_time!: number;
  public project_id!: number;
  public assigned_to_id?: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }

  // Instance methods for notification triggers
  async notifyTaskChanges(previousValues?: Partial<TaskAttributes>) {
    try {
      // Get models with proper typing
      const { Project } = this.sequelize.models;
      
      // Check if there's an assignee
      const assigneeId = this.assigned_to_id;
      
      if (!assigneeId) return;
      
      // Define the Project model type with the necessary properties
      interface ProjectModel extends Model<any, any> {
        id: number;
        name: string;
        team_id: number;
      }

      // Fetch the project directly
      const project = await Project.findByPk(this.project_id, {
        attributes: ['id', 'name', 'team_id']
      }) as any;
      
      if (!project) return;
      
      // Notify the assignee about the task assignment
      await notifyTaskAssigned(
        assigneeId,
        this.title,
        project.name,
        this.id
      );
      
      // Additional notification logic for task completion if needed
      if (this.status_title === 'completed' && previousValues?.status_title !== 'completed') {
        await notifyTaskCompleted(
          [assigneeId],  // userIds should be an array
          this.title,
          project.name,  // Add project name
          this.id
        );
      }
      
      // Check if task was completed (need to check status by name since we now use status_id)
      // This will need to be updated to work with the new status system
      // For now, we'll skip this check until we can properly implement status checking
    } catch (error) {
      console.error(`Failed to send notification for task ${this.id}:`, error);
    }
  }
}

export const initTask = (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [1, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      statuses: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of status objects with title, description, and color'
      },
      status_title: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'todo',
        comment: 'Current status title'
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      expected_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Expected time in minutes',
      },
      spent_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Spent time in minutes',
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assigned_to_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
    },
    {
      sequelize,
      tableName: 'tasks',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['status_title'],
        },
        {
          fields: ['project_id'],
        },
        {
          fields: ['assigned_to_id'],
        },
        {
          fields: ['deadline'],
        },
      ],
      hooks: {
        afterCreate: async (task: Task) => {
          await task.notifyTaskChanges();
        },
        afterUpdate: async (task: Task) => {
          if (task.changed()) {
            const previousValues = (task as any)._previousDataValues as Partial<TaskAttributes>;
            await task.notifyTaskChanges(previousValues);
          }
        },
      },
    }
  );
};

export default Task;
