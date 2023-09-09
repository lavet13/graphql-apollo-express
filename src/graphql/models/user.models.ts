import {
  Sequelize,
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ModelStatic,
} from 'sequelize';
import { MessageModel } from './message.models';
import { Models } from '.';

export interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  id: string;
  username: string;
}

export type User = ModelStatic<UserModel> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const User: User = sequelize.define<UserModel>('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING,
    },
  });

  User.associate = ({ Message }: { Message: ModelStatic<MessageModel> }) => {
    User.hasMany(Message, { onDelete: 'CASCADE' });
  };

  return User;
};
