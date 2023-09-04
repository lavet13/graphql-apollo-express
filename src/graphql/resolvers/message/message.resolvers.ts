import { MessageResolvers } from '../../__generated/types';
import { users } from '../queries';

const Message: MessageResolvers = {
  user(message, args, { me }) {
    return users[message.userId];
  },
};

export default Message;
