import { Op, Order } from 'sequelize';

import { Resolvers } from '../__generated/types';

import { isAuthenticated, isMessageOwner } from './authorization';

import {
  composeResolvers,
  ResolversComposerMapping,
} from '@graphql-tools/resolvers-composition';

import { ApolloServerErrorCode } from '@apollo/server/errors';

import { GraphQLError } from 'graphql';

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

    async messages(_, { after, before, first, last }, { models }) {
      if (Number.isFinite(first) && Number.isFinite(last)) {
        throw new GraphQLError(
          'Cannot use both first and last, discouraged by spec!',
          {
            extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
          }
        );
      }

      if (Number.isFinite(first) && (first as number) < 0) {
        throw new GraphQLError('first must be a non-negative integer.');
      }

      if (Number.isFinite(last) && (last as number) < 0) {
        throw new GraphQLError('last must be a non-negative integer.');
      }

      let where = {};
      const order: Order = [['createdAt', 'DESC']];
      let limit = first || last || DEFAULT_PAGE_SIZE;

      if (after) {
        const afterCursor = fromCursorHash(after);

        where = {
          createdAt: {
            [Op.lt]: afterCursor,
          },
        };
      }

      if (before) {
        const beforeCursor = fromCursorHash(before);

        if (!after) {
          // If before is specified without after, return messages before the cursor
          where = {
            createdAt: {
              [Op.gt]: beforeCursor,
            },
          };
        } else {
          // If both before and after are specified, return messages between them
          where = {
            createdAt: {
              [Op.between]: [beforeCursor, where.createdAt[Op.lt]],
            },
          };
        }
      }

      if (last) {
        order[0][1] = 'ASC';
      }

      const messages = await models.Message.findAll({
        where,
        order,
        limit: limit + 1,
      });

      const edges = messages?.map(message => ({
        cursor: toCursorHash(message.createdAt.toString()),
        node: message,
      }));

      let hasNextPage = false;
      let hasPreviousPage = false;

      if (messages.length > limit) {
        if (last) {
          // If using last, remove the extra message from the beginning
          edges.shift();
        } else {
          // If using first, remove the extra message from the end
          edges.pop();
        }
        hasNextPage = true;
      }

      if (after && messages.length > 0) {
        hasPreviousPage = true;
      }

      const totalCount = await models.Message.count();

      const startCursor = edges?.length > 0 ? edges[0]?.cursor : null;
      const endCursor =
        edges?.length > 0 ? edges[edges?.length - 1]?.cursor : null;

      return {
        totalCount,
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },

    // async messages(_, { after, before, first, last }, { models }) {
    //   if (Number.isFinite(first) && Number.isFinite(last)) {
    //     throw new GraphQLError(
    //       'Cannot use both first and last, discouraged by spec!',
    //       {
    //         extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
    //       }
    //     );
    //   }

    //   if (Number.isFinite(first) && (first as number) < 0) {
    //     throw new GraphQLError('first must be a non-negative integer.');
    //   }

    //   if (Number.isFinite(last) && (last as number) < 0) {
    //     throw new GraphQLError('first must be a non-negative integer.');
    //   }

    //   let where = {};
    //   const order: Order = [['createdAt', 'DESC']];
    //   let limit = first || last || DEFAULT_PAGE_SIZE;

    //   if (after) {
    //     const afterCursor = fromCursorHash(after);

    //     where = {
    //       createdAt: {
    //         [Op.lt]: afterCursor,
    //       },
    //     };
    //   }

    //   if (before) {
    //     const beforeCursor = fromCursorHash(before);
    //     where = {
    //       createdAt: {
    //         [Op.gt]: beforeCursor,
    //       },
    //     };
    //   }

    //   if (last) {
    //     order[0][1] = 'ASC';
    //     limit = last;
    //   }

    //   const messages = await models.Message.findAll({
    //     where,
    //     order,
    //     limit: limit + 1,
    //   });

    //   const edges = messages?.map(message => ({
    //     cursor: toCursorHash(message.createdAt.toString()),
    //     node: message,
    //   }));

    //   let hasNextPage = false;
    //   let hasPreviousPage = false;

    //   if (messages.length > limit) {
    //     hasNextPage = true;
    //     edges.pop();
    //   }

    //   if (after && messages.length > 0) {
    //     hasPreviousPage = true;
    //   }

    //   const totalCount = await models.Message.count();

    //   const startCursor = edges?.length > 0 ? edges[0]?.cursor : null;
    //   const endCursor =
    //     edges?.length > 0 ? edges[edges?.length - 1]?.cursor : null;

    //   return {
    //     totalCount,
    //     edges,
    //     pageInfo: {
    //       startCursor,
    //       endCursor,
    //       hasNextPage,
    //       hasPreviousPage,
    //     },
    //   };
    // },
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
