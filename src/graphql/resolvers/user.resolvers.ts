import { Resolvers } from '../__generated/types';
import dateScalars from '../scalars/date.scalars';

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
