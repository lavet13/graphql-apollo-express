import { Sequelize } from 'sequelize-typescript';
import cls from 'cls-hooked';
import Message from './message.models';
import User from './user.models';

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

sequelize.addModels([Message, User]);

export type Models = {
  User: typeof User;
  Message: typeof Message;
};

const models = sequelize.models as Models;

export { sequelize, models };
