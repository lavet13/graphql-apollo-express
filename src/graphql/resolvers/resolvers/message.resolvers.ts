import { v4 as uuidv4 } from 'uuid';
import { Resolvers, Message } from '../../__generated/types';

export default {
  Query: {
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

  Message: {
    user(message, _, { models }) {
      return models.users[message.userId];
    },
  },
} as Resolvers;
