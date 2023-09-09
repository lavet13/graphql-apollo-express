import { Resolvers, User } from '../../__generated/types';

export default {
  Query: {
    async me(_, __, { models, me }) {
      return await models.User.findByPk(me.id);
    },

    async user(_, { id }, { models }) {
      return await models.User.findByPk(id);
    },

    async users(_, __, { models }) {
      return await models.User.findAll();
    },
  },

  User: {
    // default resolver looks like this:
    // username(user) {
    //   return user.username;
    // },

    async messages(user, _, { models }) {
      return await models.Message.findAll({
        where: {
          userId: user.id,
        },
      });
    },
  },
} as Resolvers;
