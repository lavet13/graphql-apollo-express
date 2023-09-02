import { QueryResolvers } from '../__generated/types';

const users: Record<string, any> = {
  1: {
    id: '1',
    username: 'Robin Wieruch',
  },
  2: {
    id: '2',
    username: 'Dave Davids',
  },
};

const me = users[1];

const queries: QueryResolvers = {
  me() {
    return me;
  },

  user(parent, { id }) {
    return users[id];
  },

  users() {
    return Object.values(users);
  },
};

export default queries;
