import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';

import { readFileSync } from 'fs';
import resolvers from './graphql/resolvers';

export interface MyContext {
  token?: String;
}

const typeDefs = readFileSync('./src/graphql/schema.graphql', {
  encoding: 'utf-8',
});

async function bootstrap() {
  const app = express();

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  return app;
}

const app = bootstrap();

export const viteNodeApp = app;
