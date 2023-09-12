import { Sequelize, DataTypes, ModelStatic } from 'sequelize';

import { Models } from '.';

export type User = ModelStatic<any> & {
  associate?: (models: Models) => void;
  findByLogin?: (login: string) => Promise<any | null>;
};

export default (sequelize: Sequelize) => {
  const User: User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
      },
    },
    { freezeTableName: true }
  );

  User.associate = ({ Message }) => {
    User.hasMany(Message, { onDelete: 'CASCADE', foreignKey: 'user_id' });
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
