import { Sequelize } from 'sequelize';
import UserModel, { User } from './user.models';
import MessageModel, { Message } from './message.models';

const sequelize = new Sequelize(
  import.meta.env.VITE_DATABASE,
  import.meta.env.VITE_DATABASE_USER,
  import.meta.env.VITE_DATABASE_PASSWORD,
  {
    dialect: 'postgres',
  }
);

export type Models = {
  User: User;
  Message: Message;
};

const models = {
  User: UserModel(sequelize),
  Message: MessageModel(sequelize),
};

(Object.keys(models) as (keyof typeof models)[]).forEach(key => {
  const model = models[key];

  if (model.associate !== undefined) {
    model.associate(models);
  }
});

export { sequelize };

export default models;
