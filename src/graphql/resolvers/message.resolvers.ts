import { Op } from 'sequelize';

import { Resolvers } from '../__generated/types';

import { isAuthenticated, isMessageOwner } from './authorization';

import {
  composeResolvers,
  ResolversComposerMapping,
} from '@graphql-tools/resolvers-composition';

import { ApolloServerErrorCode } from '@apollo/server/errors';

import { GraphQLError } from 'graphql';

import pubsub, { EVENTS } from '../subscription';

const DEFAULT_PAGE_SIZE = 15;

const toCursorHash = (string: string) =>
  Buffer.from(string, 'utf-8').toString('base64');

const fromCursorHash = (string: string) =>
  Buffer.from(string, 'base64').toString('utf-8');

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

    async messages(_, { after, first }, { models }) {
      if (Number.isFinite(first) && (first as number) < 0) {
        throw new GraphQLError('first must be a non-negative integer.', {
          extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
        });
      }

      const limit = first || DEFAULT_PAGE_SIZE;

      const messages = await models.Message.findAll({
        where: after ? { createdAt: { [Op.lt]: fromCursorHash(after) } } : {},
        order: [['createdAt', 'DESC']],
        limit: limit + 1, // Fetch one extra to check for hasNextPage
      });

      const edges = messages.map(message => ({
        cursor: toCursorHash(message.createdAt.toString()),
        node: message,
      }));

      let hasNextPage = false;

      if (edges.length > limit) {
        // If there are more items than the 'limit', there is a next page
        hasNextPage = true;
        edges.pop(); // Remove the extra item fetched to check hasNextPage
      }

      return {
        totalCount: await models.Message.count(),
        edges,
        pageInfo: {
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          hasNextPage,
        },
      };
    },
  },

  Mutation: {
    async createMessage(_, { text, receiverId }, { me, models }) {
      const message = await models.Message.create({
        text,
        senderId: me?.id,
        receiverId,
      });

      pubsub.publish(EVENTS.MESSAGE.CREATED, {
        messageCreated: { message },
      });

      return message;
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

  Subscription: {
    messageCreated: {
      subscribe: () => ({
        [Symbol.asyncIterator]: () =>
          pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
      }),
    },
  },
};

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  'Mutation.createMessage': isAuthenticated(),
  'Mutation.deleteMessage': [isAuthenticated(), isMessageOwner()],
  'Mutation.updateMessage': [isAuthenticated(), isMessageOwner()],
};

export default composeResolvers(resolvers, resolversComposition);
