import { Resolvers } from '../__generated/types';

export default {
  Query: {
    async roles(_, __, { models }) {
      return await models.Role.findAll();
    },
  },

  Role: {
    async users(role) {
      return await role.getUsers();
    },
  },
} as Resolvers;
