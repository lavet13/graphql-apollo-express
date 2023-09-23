import { Resolvers } from '../__generated/types';

import { isAuthenticated, isMessageOwner } from './authorization';

import {
  composeResolvers,
  ResolversComposerMapping,
} from '@graphql-tools/resolvers-composition';

import { GraphQLError } from 'graphql';

const resolvers: Resolvers = {
  Query: {
    async message(_, { id }, { models }) {
      const message = await models.Message.findByPk(id);

      if (!message)
        throw new GraphQLError('Сообщение не найдено!', {
          extensions: { code: 'FORBIDDEN' },
        });

      return message;
    },

    async messages(_, __, { models }) {
      return await models.Message.findAll();
    },
  },

  Mutation: {
    async createMessage(_, { text, receiverId }, { me, models }) {
      return await models.Message.create({
        text,
        senderId: me?.id,
        receiverId,
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
    async sender(message) {
      const sender = await message.$get('sender');

      if (!sender) {
        throw new GraphQLError('Отправитель не найден!', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return sender;
    },

    async receiver(message) {
      const receiver = await message.$get('receiver');

      if (!receiver) {
        throw new GraphQLError('Получатель не найден!', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return receiver;
    },
  },
};

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  'Mutation.createMessage': isAuthenticated(),
  'Mutation.deleteMessage': [isAuthenticated(), isMessageOwner()],
  'Mutation.updateMessage': [isAuthenticated(), isMessageOwner()],
};

export default composeResolvers(resolvers, resolversComposition);
