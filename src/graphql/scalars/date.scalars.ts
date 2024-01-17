import { GraphQLScalarType, GraphQLError, Kind } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
// import { formatISO } from 'date-fns';

export default new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    // value sent to the client
    if (value instanceof Date) {
      return value.getTime();
    }

    throw new GraphQLError(
      'GraphQL Date Scalar serializer expected a `Date` object',
      { extensions: { code: ApolloServerErrorCode.GRAPHQL_PARSE_FAILED } }
    );
  },

  parseValue(value) {
    // value from the client
    if (typeof value === 'number') {
      return new Date(value);
    }

    throw new GraphQLError('GraphQL Date Scalar parser expected a `number`', {
      extensions: { code: ApolloServerErrorCode.GRAPHQL_PARSE_FAILED },
    });
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // ast value is always in string format
    }

    return null;
  },
});
