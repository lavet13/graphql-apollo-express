import { mergeTypeDefs } from '@graphql-tools/merge';

import messageTypes from './types/message.types';
import userTypes from './types/user.types';
import roleTypes from './types/role.types';

export default mergeTypeDefs([messageTypes, userTypes, roleTypes]);
