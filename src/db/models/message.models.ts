import { DataTypes, ModelStatic, Sequelize } from 'sequelize';

import { Models } from '.';

export type Message = ModelStatic<any> & {
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
      },
    },
    { freezeTableName: true }
  );

  Message.associate = ({ User }) => {
    Message.belongsTo(User, { foreignKey: 'user_id' });
  };

  return Message;
};
