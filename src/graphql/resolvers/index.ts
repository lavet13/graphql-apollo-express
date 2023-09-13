import { mergeResolvers } from '@graphql-tools/merge';

import messageResolvers from './message.resolvers';
import userResolvers from './user.resolvers';
import scalarsResolvers from '../scalars/resolvers/scalars.resolvers';

export default mergeResolvers([
  messageResolvers,
  userResolvers,
  scalarsResolvers,
]);
