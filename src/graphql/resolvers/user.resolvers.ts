import { UserModel } from '../../db/models/user.models';
import { Resolvers } from '../__generated/types';
import dateScalars from '../scalars/date.scalars';

const createToken = (user: UserModel) => {
  return '';
};

export default {
  Date: dateScalars,

  Query: {
    async me(_, __, { me }) {
      return me ? me : null;

      // return await models.User.findByPk(me.id);
    },

    async user(_, { id }, { models }) {
      return await models.User.findByPk(id);
    },

    async users(_, __, { models }) {
      return await models.User.findAll();
    },
  },

  Mutation: {
    async signUp(_, { email, password, username }, { models }) {
      console.log({ password });
      const user = await models.User.create({
        username,
        password,
        email,
      });

      return { token: createToken(user) };
    },
  },

  User: {
    async messages(user, _, { models }) {
      return await models.Message.findAll({
        where: {
          user_id: user.id,
        },
        order: [['updatedAt', 'DESC']],
      });
    },
  },
} as Resolvers;
