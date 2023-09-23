import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/schema',

  generates: {
    './src/graphql/__generated/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../../app#ContextValue',
        mappers: {
          Message: '../../db/models/message.models#MessageModel',
          User: '../../db/models/user.models#UserModel',
          Role: '../../db/models/role.models#RoleModel',
        },
      },
    },
  },

  watch: true,
};

export default config;
