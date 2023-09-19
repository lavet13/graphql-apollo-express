import { ModelStatic, Sequelize } from 'sequelize';
import { Models } from '.';

export type User_Role = ModelStatic<any> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const User_Role: User_Role = sequelize.define(
    'user_role',
    {},
    { freezeTableName: true, timestamps: false, underscored: true }
  );

  return User_Role;
};
