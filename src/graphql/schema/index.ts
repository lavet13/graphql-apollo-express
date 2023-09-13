import { mergeTypeDefs } from '@graphql-tools/merge';

import messageTypes from './types/message.types';
import userTypes from './types/user.types';
import scalarsTypes from '../scalars/types/scalars.types';

export default mergeTypeDefs([messageTypes, userTypes, scalarsTypes]);
