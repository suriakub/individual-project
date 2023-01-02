import { DataTypes, Model, Sequelize } from 'sequelize';

export class User extends Model {
  username?: string;
  uuid?: string;
}

export function defineUserModel(sequelize: Sequelize) {
  const structure = {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
  };

  const config = {
    sequelize: sequelize,
    modelName: 'users',
    tableName: 'users',
  };

  User.init(structure, config);
  return User;
}
