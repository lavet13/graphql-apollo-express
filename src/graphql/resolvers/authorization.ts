import { GraphQLError, GraphQLFieldResolver } from 'graphql';

import { ResolversComposition } from '@graphql-tools/resolvers-composition';

import {
  MutationCreateMessageArgs,
  MutationDeleteMessageArgs,
  ResolversParentTypes,
} from '../__generated/types';

import { ContextValue } from '../../app';

type AuthenticatedResolver = GraphQLFieldResolver<
  ResolversParentTypes['Mutation'],
  ContextValue,
  MutationCreateMessageArgs
>;

export const isAuthenticated =
  (): ResolversComposition<AuthenticatedResolver> =>
  next =>
  (root, args, context, info) => {
    if (!context.me) {
      throw new GraphQLError('Не аутентифицирован как пользователь.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return next(root, args, context, info);
  };

type IsMessageOwnerResolver = GraphQLFieldResolver<
  ResolversParentTypes['Mutation'],
  ContextValue,
  MutationDeleteMessageArgs
>;

export const isMessageOwner =
  (): ResolversComposition<IsMessageOwnerResolver> =>
  next =>
  async (root, args, context, info) => {
    const message = await context.models.Message.findByPk(args.id, {
      raw: true,
    });

    if (message?.userId !== context.me?.id) {
      throw new GraphQLError('Не аутентифицирован как владелец.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return next(root, args, context, info);
  };
