import { Resolvers } from '../__generated/types';

export default {
  Query: {
    async roles(parent, _, { models }) {
      return await models.Role.findAll();
    },
  },
  Role: {
    async users(role, _, { models }) {
      console.log({ role });
      return await models.User.findAll({
        where: { roleId: role.id },
      });
    },
  },
} as Resolvers;
