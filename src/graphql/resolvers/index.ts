import { mergeResolvers } from '@graphql-tools/merge';

import messageResolvers from './message.resolvers';
import userResolvers from './user.resolvers';

export default mergeResolvers([messageResolvers, userResolvers]);
