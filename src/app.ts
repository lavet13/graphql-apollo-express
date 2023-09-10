import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import models, { Models, sequelize } from './db/models';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';

import { User } from './graphql/__generated/types';
import { makeExecutableSchema } from '@graphql-tools/schema';

export interface ContextValue {
  me: User | null;
  models: Models;
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
      context: async _ => ({
        me: await models.User.findByLogin?.('ddavids'),
        models,
      }),
    })
  );

  return app;
}

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'rwieruch',
      messages: [{ text: 'Published the Road to learn React' }],
    },
    { include: [models.Message] }
  );

  await models.User.create(
    {
      username: 'ddavids',
      messages: [
        { text: 'Happy to release . . .' },
        { text: 'Published a complete . . .' },
      ],
    },
    { include: [models.Message] }
  );
};

const app = bootstrap();

export const viteNodeApp = app;
