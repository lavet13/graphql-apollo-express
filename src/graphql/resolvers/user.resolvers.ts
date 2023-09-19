import { UserModel } from '../../db/models/user.models';
import { Resolvers } from '../__generated/types';

import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

import dateScalars from '../scalars/date.scalars';
import jwt from 'jsonwebtoken';

const createToken = (user: UserModel, secret: string, expiresIn: string) => {
  const { id, email, username } = user;
  return jwt.sign({ id, email, username }, secret, { expiresIn });
};

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
        roleId: 2,
      });

      return { token: createToken(user, secret, expiresIn) };
    },

    async signIn(_, { login, password }, { models, secret, expiresIn }) {
      const user = (await models.User.findByLogin?.(login)) as UserModel | null;

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

      return { token: createToken(user, secret, expiresIn) };
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
        order: [['updatedAt', 'DESC']],
      });
    },

    async role(user, _, { models }) {
      return await models.Role.findOne({
        where: { id: user.roleId },
      });
    },
  },
} as Resolvers;
