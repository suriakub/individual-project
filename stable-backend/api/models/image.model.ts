import { DataTypes, Model, Sequelize } from 'sequelize';

export class Image extends Model {
  name?: string;
  uuid?: string;
  userId?: string;
  order?: number;
}

export function defineImageModel(sequelize: Sequelize) {
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

  return Image;
}
