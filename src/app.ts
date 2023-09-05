import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';
import models, { Models } from './graphql/models';

import { User } from './graphql/__generated/types';
import { makeExecutableSchema } from '@graphql-tools/schema';

export interface ContextValue {
  me: User;
  models: Models;
}

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function bootstrap() {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer<ContextValue>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware<ContextValue>(server, {
      context: async _ => {
        return { me: models.users[1], models };
      },
    })
  );

  return app;
}

const app = bootstrap();

export const viteNodeApp = app;
