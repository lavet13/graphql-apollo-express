import { Message, MutationResolvers } from '../__generated/types';
import { v4 as uuidv4 } from 'uuid';
import { messages, setMessages, users } from './queries';

const Mutation: MutationResolvers = {
  createMessage(parent, { text }, { me }) {
    const id = uuidv4();

    const message: Message = {
      id,
      text,
      userId: me.id,
    };

    messages[id] = message;
    users[me.id].messageIds.push(id);

    return message;
  },

  deleteMessage(parent, { id }, { me }) {
    const { [id]: message, ...otherMessages } = messages;

    if (!message) {
      return false;
    }

    setMessages(otherMessages);

    return true;
  },

  updateMessage(parent, { id, text }) {
    const updatedMessage = messages[id];

    if (!updatedMessage) return null;

    updatedMessage.text = text;

    return updatedMessage;
  },
};

export default Mutation;
