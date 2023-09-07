import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/schema',

  generates: {
    './src/graphql/__generated/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../../app#ContextValue',
      },
    },
  },

  watch: true,
};

export default config;
