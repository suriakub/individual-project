import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { Image } from './image.model';
import { User } from './user.model';

export class ImageCollection extends Model {
  uuid?: string;
  name?: string;
  userId?: string;
}

export function defineImageCollectionModel(sequelize: Sequelize, user: ModelStatic<User>) {
  const structure = {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  };

  const config = {
    sequelize: sequelize,
    modelName: 'image-collections',
    tableName: 'image-collections',
  };

  ImageCollection.init(structure, config);
  ImageCollection.belongsTo(user, {foreignKey: 'userId'});

  return ImageCollection;
}
