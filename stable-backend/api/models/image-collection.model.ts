import { DataTypes, Model, Sequelize } from 'sequelize';

export class ImageCollection extends Model {
  uuid?: string;
  name?: string;
  userId?: string;
}

export function defineImageCollectionModel(sequelize: Sequelize) {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  };

  const config = {
    sequelize: sequelize,
    modelName: 'image-collections',
    tableName: 'image-collections',
  };

  ImageCollection.init(structure, config);

  return ImageCollection;
}
