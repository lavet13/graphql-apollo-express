import { mergeTypeDefs } from '@graphql-tools/merge';

import messageTypes from './types/message.types';
import userTypes from './types/user.types';

export default mergeTypeDefs([messageTypes, userTypes]);
