import { Resolvers } from '../__generated/types';
import Query from '../resolvers/queries';

import User from './user/user.resolvers';
import Message from './message/message.resolvers';

const resolvers: Resolvers = {
  Query,
  User,
  Message,
};

export default resolvers;
