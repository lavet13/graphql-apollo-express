import { Resolvers, User } from '../../__generated/types';

export default {
  Query: {
    me(_, __, { me }) {
      return me;
    },

    user(_, { id }, { models }) {
      return models.users[id];
    },

    users(_, __, { models }) {
      return Object.values<User>(models.users);
    },
  },

  User: {
    // default resolver looks like this:
    // username(user) {
    //   return user.username;
    // },

    messages(user, _, { models }) {
      return Object.values(models.messages).filter(message =>
        user.messageIds.includes(message.id)
      );
    },
  },
} as Resolvers;
