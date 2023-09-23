import 'dotenv/config';
import express, { Request } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerErrorCode } from '@apollo/server/errors';

import { Models, sequelize, models } from './db/models';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';

import { makeExecutableSchema } from '@graphql-tools/schema';

import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

export interface ContextValue {
  me?: jwt.MeJwtPayload | null;
  models: Models;
  secret: string;
  expiresIn: string;
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function bootstrap() {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer<ContextValue>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError(formattedError, _) {
      if (formattedError.message.startsWith('Validation error:')) {
        return {
          ...formattedError,
          message: formattedError.message.replace(/^Validation error: /, ''),
          extensions: {
            ...formattedError?.extensions,
            code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
          },
        };
      }

      return formattedError;
    },
  });

  await server.start();

  const eraseDatabaseOnSync = true;

  await sequelize.sync({ force: eraseDatabaseOnSync });

  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }

  app.use(
    '/',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware<ContextValue>(server, {
      context: async ({ req }) => {
        const me = getMe(req);

        return {
          me,
          models,
          secret: import.meta.env.VITE_JWT_SECRET,
          expiresIn: import.meta.env.VITE_JWT_EXPIRES_IN,
        };
      },
    })
  );

  if (import.meta.env.PROD) {
    // Modified server startup
    httpServer.listen(
      Number.parseInt(import.meta.env.VITE_SERVER_PORT) || 4000
    );
  }

  return app;
}

// Sequelize automatically pluralizes the model name and uses that as the table name.
// this pluralization is done under the hood by a library: https://www.npmjs.com/package/inflection
const createUsersWithMessages = async () => {
  try {
    const adminRole = await models.Role.create({ name: 'Admin' });
    const userRole = await models.Role.create({ name: 'User' });

    const firstUser = await models.User.create({
      username: 'rwieruch',
      email: 'rwieruch@gmail.com',
      password: 'password',
    });

    await firstUser.$add('roles', [adminRole, userRole]);

    const secondUser = await models.User.create({
      username: 'ddavids',
      email: 'ddavids@gmail.com',
      password: 'password',
    });

    await secondUser.$add('roles', userRole);

    await models.Message.bulkCreate([
      { text: 'Happy to realese . . .', userId: firstUser.id },
      { text: 'Published a complete . . .', userId: secondUser.id },
    ]);
  } catch (error) {
    console.log({ error });
  }
};

const getMe = (req: Request) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return <jwt.MeJwtPayload>(
        jwt.verify(token, import.meta.env.VITE_JWT_SECRET)
      );
    } catch (error) {
      throw new GraphQLError(
        'Срок действия вашего сеанса истек. Войдите в систему еще раз.',
        { extensions: { code: 'SESSION_EXPIRED' } }
      );
    }
  }
};

const app = bootstrap();

export const viteNodeApp = app;
