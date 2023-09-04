import { Message, QueryResolvers, User } from '../__generated/types';

export const users: Record<string, User> = {
  1: {
    id: '1',
    username: 'Robin Wieruch',
    messageIds: ['1'],
  },
  2: {
    id: '2',
    username: 'Dave Davids',
    messageIds: ['1', '2'],
  },
};

export const messages: Record<string, Message> = {
  1: {
    id: '1',
    text: 'Hello World',
    userId: '1',
  },
  2: {
    id: '2',
    text: 'Bye World',
    userId: '2',
  },
};

const queries: QueryResolvers = {
  me(_, __, { me }) {
    return me;
  },

  user(_, { id }) {
    return users[id];
  },

  users() {
    return Object.values<User>(users);
  },

  message(_, { id }) {
    return messages[id];
  },

  messages() {
    return Object.values<Message>(messages);
  },
};

export default queries;
