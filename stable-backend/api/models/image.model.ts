import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { Models } from './models';
import { ImageCollection } from './image-collection.model';

export class Image extends Model {
  name?: string;
  uuid?: string;
  userId?: string;
  order?: number;
}

export function defineImageModel(sequelize: Sequelize, imageCollection: ModelStatic<ImageCollection>) {
  const structure = {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    uuid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    collectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  };

  const config = {
    sequelize: sequelize,
    modelName: 'images',
    tableName: 'images',
  };
  Image.init(structure, config);

  Image.belongsTo(imageCollection, {foreignKey: 'collectionId'});
  return Image;
}
