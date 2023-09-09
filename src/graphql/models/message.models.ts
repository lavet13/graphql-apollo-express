import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelStatic,
  Sequelize,
} from 'sequelize';

import { UserModel } from './user.models';
import { Models } from '.';

export interface MessageModel
  extends Model<
    InferAttributes<MessageModel>,
    InferCreationAttributes<MessageModel>
  > {
  text: string;
}

export type Message = ModelStatic<MessageModel> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Message: Message = sequelize.define<MessageModel>('message', {
    text: {
      type: DataTypes.TEXT,
    },
  });

  Message.associate = ({ User }: { User: ModelStatic<UserModel> }) => {
    Message.belongsTo(User);
  };

  return Message;
};
