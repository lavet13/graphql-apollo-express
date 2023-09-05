import { Message, User } from '../__generated/types';

let users: Record<string, User> = {
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

let messages: Record<string, Message> = {
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

export type Models = {
  users: typeof users;
  messages: typeof messages;
};

const models: Models = {
  users,
  messages,
};

export default models;
