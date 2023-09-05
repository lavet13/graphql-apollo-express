import { v4 as uuidv4 } from 'uuid';
import { Message, Resolvers, User } from '../__generated/types';

const resolvers: Resolvers = {
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

    message(_, { id }, { models }) {
      return models.messages[id];
    },

    messages(_, __, { models }) {
      return Object.values<Message>(models.messages);
    },
  },

  Mutation: {
    createMessage(_, { text }, { me, models }) {
      const id = uuidv4();

      const message: Message = {
        id,
        text,
        userId: me.id,
      };

      models.messages[id] = message;
      models.users[me.id].messageIds.push(id);

      return message;
    },

    deleteMessage(_, { id }, { models }) {
      const { [id]: message, ...otherMessages } = models.messages;

      if (!message) {
        return false;
      }

      models.messages = otherMessages;

      return true;
    },

    updateMessage(_, { id, text }, { models }) {
      const updatedMessage = models.messages[id];

      if (!updatedMessage) return null;

      updatedMessage.text = text;

      return updatedMessage;
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

  Message: {
    user(message, _, { models }) {
      return models.users[message.userId];
    },
  },
};

export default resolvers;
