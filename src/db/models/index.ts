import { Sequelize } from 'sequelize-typescript';
import cls from 'cls-hooked';
import Message from './message.models';
import User from './user.models';
import Role from './role.models';
import UserRole from './user_role.models';

export const namespace = cls.createNamespace('my-namespace');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(
  import.meta.env.VITE_DATABASE,
  import.meta.env.VITE_DATABASE_USER,
  import.meta.env.VITE_DATABASE_PASSWORD,
  {
    dialect: 'postgres',
  }
);

sequelize.addModels([Message, User, Role, UserRole]);

export type Models = {
  User: typeof User;
  Message: typeof Message;
  Role: typeof Role;
  UserRole: typeof UserRole;
};

const models = sequelize.models as Models;

export { sequelize, models };
