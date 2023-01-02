import { ModelStatic } from 'sequelize';
import { User } from './user.model';
import { Image } from './image.model';
import { ImageCollection } from './image-collection.model';

export interface Models {
  user: ModelStatic<User>;
  image: ModelStatic<Image>;
  imageCollection: ModelStatic<ImageCollection>;
}
