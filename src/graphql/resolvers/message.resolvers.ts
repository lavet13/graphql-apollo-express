import { Op } from 'sequelize';

import { Resolvers } from '../__generated/types';

import { isAuthenticated, isMessageOwner } from './authorization';

import {
  composeResolvers,
  ResolversComposerMapping,
} from '@graphql-tools/resolvers-composition';

import { ApolloServerErrorCode } from '@apollo/server/errors';

import { GraphQLError } from 'graphql';

const toCursorHash = (string: string) => Buffer.from(string).toString('base64');

const fromCursorHash = (string: string) =>
  Buffer.from(string, 'base64').toString('ascii');

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
      const limit = first ?? 25;

      const { count: totalCount, rows: messages } =
        await models.Message.findAndCountAll({
          order: [['createdAt', 'DESC']],
          limit: limit + 1,
          where: after
            ? {
                createdAt: { [Op.lt]: fromCursorHash(after) },
              }
            : {},
        });

      if (messages.length === 0) {
        throw new GraphQLError('Out of range!', {
          extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
        });
      }

      const messagesWithCursors = messages.map(message => ({
        cursor: toCursorHash(message.createdAt.toString()),
        node: message,
      }));

      const hasNextPage = messagesWithCursors.length > limit;
      const edges = hasNextPage
        ? messagesWithCursors.slice(0, -1)
        : messagesWithCursors;

      return {
        totalCount,
        edges,
        pageInfo: {
          endCursor: toCursorHash(
            edges[edges.length - 1].node.createdAt.toString()
          ),
          hasNextPage,
        },
      };
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
