import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { readFileSync } from 'fs';
import resolvers from './graphql/resolvers';
import { users } from './graphql/resolvers/queries';
import { User } from './graphql/__generated/types';

export interface ContextValue {
  me: User;
}

const typeDefs = readFileSync('./src/graphql/schema.graphql', {
  encoding: 'utf-8',
});

async function bootstrap() {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer<ContextValue>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware<ContextValue>(server, {
      context: async _ => {
        return { me: users[1] };
      },
    })
  );

  return app;
}

const app = bootstrap();

export const viteNodeApp = app;
