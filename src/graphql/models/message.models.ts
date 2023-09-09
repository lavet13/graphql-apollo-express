import { DataTypes, ModelStatic, Sequelize } from 'sequelize';

import { Models } from '.';

export type Message = ModelStatic<any> & {
  [key: string]: any;
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Message: Message = sequelize.define('message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
    },
  });

  Message.associate = ({ User }) => {
    Message.belongsTo(User);
  };

  return Message;
};
