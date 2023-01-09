import { Sequelize } from 'sequelize';
import { User, defineUserModel } from '../models/user.model';
import { Image, defineImageModel } from '../models/image.model';
import { ImageCollection, defineImageCollectionModel } from '../models/image-collection.model';

class MySqlConnection {
  private _sequelize: Sequelize;

  constructor() {
    this._sequelize = new Sequelize('db', 'user', 'password', {
      host: 'localhost',
      dialect: 'mysql',
      logging: false
    });
    this.defineModels();
  }

  init = async () => {
    await this._sequelize.authenticate();
    await this._sequelize.sync({ alter: true });
    await this.populateDb();
  };

  private defineModels() {
    const user = defineUserModel(this._sequelize);
    const imageCollection = defineImageCollectionModel(this._sequelize, user);
    const image = defineImageModel(this._sequelize, imageCollection);
    const models = { user, imageCollection, image };

    return models;
  }

  private async populateDb() {
    const user = await User.findOrCreate({ where: { username: 'testUser' } });
    const imageCollection = await ImageCollection.findOrCreate({
      where: { name: 'Collection1', userId: user[0].uuid },
    });
    const image1 = await Image.findOrCreate({
      where: { name: 'fuji1.jpg', collectionId: imageCollection[0].uuid, order: 0 },
    });
    const image2 = await Image.findOrCreate({
      where: { name: 'fuji2.jpg', collectionId: imageCollection[0].uuid, order: 1 },
    });
    
  }

  get sequelize() {
    return this._sequelize;
  }
}

export const mysql: MySqlConnection = new MySqlConnection();
