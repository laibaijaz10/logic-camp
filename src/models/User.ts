import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Attributes interface
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "team_lead" | "employee";
  is_active: boolean;
  is_approved: boolean;
  notifications?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes: id, createdAt, updatedAt are optional
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> { }

// Model class
class User extends Model<UserAttributes, UserCreationAttributes>

  implements UserAttributes {
  // Declare fields so TS knows they exist
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: "admin" | "team_lead" | "employee";
  declare is_active: boolean;
  declare is_approved: boolean;
  declare notifications?: object | null;

  // timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }
}

// Initialize the model
export const initUser = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { len: [1, 100] },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "team_lead", "employee"),
        allowNull: false,
        defaultValue: "employee",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notifications: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
      underscored: true, // use created_at / updated_at
      indexes: [
        { fields: ["email"], unique: true },
        { fields: ["role"] },
        { fields: ["is_approved"] },
      ],
    }
  );
};

export { User };
export default User;
