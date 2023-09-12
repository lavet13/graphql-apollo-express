import { GraphQLScalarType, GraphQLError, Kind } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { intlFormat } from 'date-fns';
import { ru } from 'date-fns/locale';

export default new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    // value sent to the client
    if (value instanceof Date) {
      return intlFormat(
        value,
        {
          month: '2-digit',
          year: 'numeric',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        },
        { locale: ru.code }
      );
    }

    throw new GraphQLError(
      'GraphQL Date Scalar serializer expected a `Date` object',
      { extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR } }
    );
  },

  parseValue(value) {
    // value from the client
    if (typeof value === 'number') {
      return new Date(value);
    }

    throw new GraphQLError('GraphQL Date Scalar parser expected a `number`', {
      extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
    });
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // ast value is always in string format
    }

    return null;
  },
});
