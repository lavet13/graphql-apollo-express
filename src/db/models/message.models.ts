import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelStatic,
  CreationOptional,
  Sequelize,
} from 'sequelize';

import { gunzipSync, gzipSync } from 'node:zlib';

import { Models } from '.';

export interface MessageModel
  extends Model<
    InferAttributes<MessageModel>,
    InferCreationAttributes<MessageModel>
  > {
  id: CreationOptional<string>;
  text: string;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
  userId: CreationOptional<string>;
}

export type Message = ModelStatic<MessageModel> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Message: Message = sequelize.define(
    'message',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      text: {
        type: DataTypes.TEXT,
        validate: {
          notEmpty: {
            msg: 'Сообщение не должно быть пусто!',
          },
        },

        get() {
          const storedValue = this.getDataValue('text');
          const gzippedBuffer = Buffer.from(storedValue, 'base64');
          const unzippedBuffer = gunzipSync(gzippedBuffer);
          return unzippedBuffer.toString();
        },

        set(value: string) {
          const gzippedBuffer = gzipSync(value);
          this.setDataValue('text', gzippedBuffer.toString('base64'));
        },
      },
    },
    { freezeTableName: true, underscored: true }
  );

  Message.associate = ({ User }) => {
    Message.belongsTo(User, {
      foreignKey: { allowNull: false },
    });
  };

  return Message;
};
