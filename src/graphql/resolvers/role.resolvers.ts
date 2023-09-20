import { Resolvers } from '../__generated/types';

const resolvers: Resolvers = {
  Query: {
    async roles(_, __, { models }) {
      return await models.Role.findAll();
    },
  },

  Role: {
    async users(role) {
      return await role.getUsers({ joinTableAttributes: [] });
    },
  },
};

export default resolvers;
