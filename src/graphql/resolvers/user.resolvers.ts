import { Resolvers } from '../__generated/types';

import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

import dateScalars from '../scalars/date.scalars';
import jwt from 'jsonwebtoken';
import User from '../../db/models/user.models';
import { MappedRoleModel } from '../..';

import {
  composeResolvers,
  ResolversComposerMapping,
} from '@graphql-tools/resolvers-composition';
import { isAdmin, isAuthenticated } from './authorization';

const createToken = async (user: User, secret: string, expiresIn: string) => {
  const { id, email, username } = user;

  const roles = (await user.$get('roles')) as MappedRoleModel[];

  const payload: jwt.MeJwtPayload = {
    id,
    email,
    username,
    roles,
  };

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

const resolvers: Resolvers = {
  Date: dateScalars,

  Query: {
    async me(_, __, { me, models }) {
      if (!me) return null;

      return await models.User.findByPk(me.id);
    },

    async user(_, { id }, { models }) {
      return await models.User.findByPk(id);
    },

    async users(_, __, { models }) {
      return await models.User.findAll();
    },
  },

  Mutation: {
    async signUp(
      _,
      { email, password, username },
      { models, secret, expiresIn }
    ) {
      const user = await models.User.create({
        username,
        password,
        email,
      });

      const userRole = await models.Role.findOne({ where: { name: 'User' } });

      if (!userRole) {
        throw new GraphQLError('Не найдена роль!(User)', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await user.$add('roles', userRole);

      return { token: await createToken(user, secret, expiresIn) };
    },

    async signIn(_, { login, password }, { models, secret, expiresIn }) {
      const user = (await models.User.findByLogin?.(login)) as User | null;

      if (!user) {
        throw new GraphQLError('Логин не существует', {
          extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
        });
      }

      const isValid = await user.validatePassword(password);

      if (typeof isValid === 'boolean' && !isValid) {
        throw new GraphQLError('Неверный пароль', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return { token: await createToken(user, secret, expiresIn) };
    },

    async deleteUser(_, { id }, { models }) {
      return !!(await models.User.destroy({
        where: {
          id,
        },
      }));
    },
  },

  User: {
    async messages(user, _, { models }) {
      return await models.Message.findAll({
        where: {
          userId: user.id,
        },
        order: [['id', 'ASC']],
      });
    },

    async roles(user) {
      return await user.$get('roles');
    },
  },
};

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  'Mutation.deleteUser': [isAuthenticated(), isAdmin()],
};

export default composeResolvers(resolvers, resolversComposition);
