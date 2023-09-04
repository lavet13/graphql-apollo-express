import { UserResolvers } from '../../__generated/types';
import { messages } from '../queries';

const User: UserResolvers = {
  username(user) {
    return user.username;
  },

  messages(user) {
    return Object.values(messages).filter(message =>
      user.messageIds.includes(message.id)
    );
  },
};

export default User;
