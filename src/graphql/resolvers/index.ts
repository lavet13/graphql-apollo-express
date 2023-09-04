import { Resolvers } from '../__generated/types';
import Query from './queries';
import Mutation from './mutations';

import User from './user/user.resolvers';
import Message from './message/message.resolvers';

const resolvers: Resolvers = {
  Query,
  Mutation,
  User,
  Message,
};

export default resolvers;
