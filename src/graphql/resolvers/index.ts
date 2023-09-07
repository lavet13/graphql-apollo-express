import { mergeResolvers } from '@graphql-tools/merge';

import messageResolvers from './resolvers/message.resolvers';
import userResolvers from './resolvers/user.resolvers';

export default mergeResolvers([messageResolvers, userResolvers]);
