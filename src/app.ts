import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerErrorCode } from '@apollo/server/errors';

import models, { Models, namespace, sequelize, t } from './db/models';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';

import { User } from './graphql/__generated/types';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { Op, Sequelize, Transaction } from 'sequelize';

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
      context: async _ => ({
        me: await models.User.findByLogin?.('ddavids'),
        models,
      }),
    })
  );

  return app;
}

// Sequelize automatically pluralizes the model name and uses that as the table name.
// this pluralization is done under the hood by a library: https://www.npmjs.com/package/inflection
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

  await models.Captain.create(
    { name: 'Jack Sparrow', ship: [{ name: "this is jack's ship tho :D" }] },
    { include: [models.Ship] }
  );

  await models.Foo.create(
    {
      name: 'just a name',
      bars: [{ title: 'just a title' }],
    },
    { include: [models.Bar] }
  );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.findAll({
  //       attributes: ['id', 'text'],
  //       where: {
  //         id: {
  //           [Op.notIn]: [1, 2],
  //         },
  //       },
  //       include: [
  //         {
  //           model: models.User,
  //         },
  //       ],
  //     })
  //   )
  // );
  // console.log(
  //   JSON.stringify(
  //     await models.Foo.findAll({
  //       include: [
  //         {
  //           model: models.Bar,
  //           through: {
  //             attributes: [],
  //           },
  //         },
  //       ],
  //       order: [[models.Bar, 'id', 'DESC']],
  //     })
  //   )
  // );

  // const [Foo, FooIsCreated] = await models.Foo.findOrCreate({
  //   where: {
  //     name: 'just a name :DDDDD',
  //   },
  //   defaults: {
  //     name: 'LULE',
  //   },
  // });

  // if (FooIsCreated) {
  //   console.log(JSON.stringify(Foo));
  // }

  // const { count, rows } = await models.Message.findAndCountAll({
  // where: {
  //   text: {
  //     [Op.like]: 'P%',
  //   },
  // },

  //   limit: 3,
  //   offset: 0,
  // });

  // console.log(count, JSON.stringify(rows));

  // console.log(
  //   JSON.stringify(
  //     await models.User.create(
  //       { username: 'ivan' },
  //       { fields: ['id', 'updatedAt', 'createdAt'] }
  //     )
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.User.findAll({
  //       attributes: [
  //         ['id', 'user_id'],
  //         [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
  //         'username',
  //       ],
  //       group: 'id',
  //     })
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.findAll({
  //       where: {
  //         [Op.and]: [
  //           {
  //             user_id: {
  //               [Op.or]: [1, 2],
  //             },
  //           },
  //           {
  //             text: {
  //               [Op.like]: 'P%',
  //             },
  //           },
  //         ],
  //       },
  //     })
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.findAll({
  //       where: {
  //         [Op.not]: {
  //           [Op.or]: [
  //             {
  //               text: {
  //                 [Op.like]: 'P%',
  //               },
  //             },
  //             {
  //               user_id: 1,
  //             },
  //           ],
  //         },
  //       },
  //     })
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.findAll({
  //       where: {
  //         [Op.and]: [
  //           sequelize.where(
  //             sequelize.fn('char_length', sequelize.col('text')),
  //             { [Op.lt]: 30 }
  //           ),
  //           {
  //             text: {
  //               [Op.notLike]: 'P%',
  //             },
  //           },
  //         ],
  //       },
  //     })
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.update(
  //       { text: 'updated text' },
  //       {
  //         where: {
  //           user_id: 2,
  //         },
  //       }
  //     )
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.destroy({
  //       where: {
  //         text: {
  //           [Op.like]: 'P%',
  //         },
  //       },
  //     })
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.destroy({
  //       truncate: true,
  //     })
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Captain.bulkCreate(
  //       [{ name: 'Glad Valakas' }, { name: 'Davy Jones' }],
  //       { validate: true, fields: ['name'] }
  //     )
  //   )
  // );

  // console.log(
  //   JSON.stringify(
  //     await models.Message.findAll({
  //       attributes: ['id', 'text'],
  //       order: [
  //         [sequelize.fn('max', sequelize.col('message.createdAt')), 'DESC'],
  //         [models.User, 'updatedAt', 'DESC'],
  //       ],
  //       group: [sequelize.col('message.id'), sequelize.col('user.id')],
  //       include: [
  //         {
  //           model: models.User,
  //           required: true,
  //           attributes: ['id', 'username'],
  //         },
  //       ],
  //     })
  //   )
  // );

  // Unmanaged transaction
  // try {
  //   const user = await models.User.create(
  //     {
  //       username: 'ivan',
  //     },
  //     { transaction: t }
  //   );

  //   const message = await user.createMessage(
  //     { text: 'just a text message' },
  //     { transaction: t }
  //   );

  //   console.log(JSON.stringify(user));
  //   console.log(JSON.stringify(message));

  //   await t.commit();
  // } catch (error) {
  //   await t.rollback();
  // }

  // Managed transaction
  // try {
  //   const result = await sequelize.transaction(
  //     { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
  //     async t => {
  //       t.afterCommit(() => {
  //         console.log('after commit :D');
  //       });
  //       console.log(namespace.get('transaction') === t);

  //       const user = await models.User.create({
  //         username: 'Ivan',
  //       });

  //       const message = await user.createMessage({ text: 'my first message' });

  //       return { user, message };
  //     }
  //   );

  //   console.log(JSON.stringify(result));
  // } catch (error) {
  //   console.error(error);
  // }

  // Testing validations
  try {
    console.log(JSON.stringify(await models.User.create({ username: '' })));
  } catch (error) {
    console.log({ error });
  }
};

const app = bootstrap();

export const viteNodeApp = app;
