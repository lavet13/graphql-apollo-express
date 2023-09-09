import { v4 as uuidv4 } from 'uuid';
import { Resolvers, Message } from '../../__generated/types';

export default {
  Query: {
    async message(_, { id }, { models }) {
      return await models.Message.findByPk(id);
    },

    async messages(_, __, { models }) {
      return await models.Message.findAll();
    },
  },

  Mutation: {
    async createMessage(_, { text }, { me, models }) {
      return await models.Message.create({
        text,
        userId: me.id,
      });
    },

    async deleteMessage(_, { id }, { models }) {
      return await models.Message.destroy({ where: { id } });
    },

    async updateMessage(_, { id, text }, { models }) {
      return await models.Message.update({ text }, { where: { id } });
    },
  },

  Message: {
    async user(message, _, { models }) {
      return await models.User.findByPk(message.userId);
    },
  },
} as Resolvers;
