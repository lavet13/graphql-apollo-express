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
  findByLogin?: (login: string) => Promise<UserModel | null>;
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

  User.findByLogin = async (login: string) => {
    let user = await User.findOne({
      where: { username: login },
    });

    // if (!user) {
    //       user = await User.findOne({
    //         where: { email: login },
    //       });
    //     }

    return user;
  };

  return User;
};
