import { Message, Resolvers } from '../__generated/types';

import { isAuthenticated, isMessageOwner } from './authorization';
import {
  composeResolvers,
  ResolversComposerMapping,
} from '@graphql-tools/resolvers-composition';

type MyMessage = Message & { userId?: string };

const resolvers = {
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
        user_id: me?.id,
      });
    },

    async deleteMessage(_, { id }, { models }) {
      return !!(await models.Message.destroy({ where: { id } }));
    },

    async updateMessage(_, { id, text }, { models }) {
      return await models.Message.update({ text }, { where: { id } });
    },
  },

  Message: {
    async user(message: MyMessage, _, { models }) {
      return await models.User.findByPk(message.userId);
    },
  },
} as Resolvers;

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  'Mutation.createMessage': isAuthenticated(),
  'Mutation.deleteMessage': [isAuthenticated(), isMessageOwner()],
  'Mutation.updateMessage': [isAuthenticated(), isMessageOwner()],
};

export default composeResolvers(resolvers, resolversComposition);
