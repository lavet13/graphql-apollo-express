import 'dotenv/config';
import express, { Request } from 'express';
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

import jwt, { MeJwtPayload } from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { UserModel } from './db/models/user.models';

export interface ContextValue {
  me?: MeJwtPayload;
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

  return app;
}

// Sequelize automatically pluralizes the model name and uses that as the table name.
// this pluralization is done under the hood by a library: https://www.npmjs.com/package/inflection
const createUsersWithMessages = async () => {
  try {
    const adminRole = await models.Role.create({ name: 'Admin' });
    const userRole = await models.Role.create({ name: 'User' });

    const firstUser = await models.User.create(
      {
        username: 'rwieruch',
        email: 'rwieruch@gmail.com',
        password: 'password',
        messages: [{ text: 'Published the Road to learn React' }],
      },
      { include: [models.Message] }
    );

    firstUser.setRole(adminRole);

    const secondUser = await models.User.create(
      {
        username: 'ddavids',
        email: 'ddavids@gmail.com',
        password: 'password',
        messages: [
          { text: 'Happy to release . . .' },
          { text: 'Published a complete . . .' },
        ],
      },
      { include: [models.Message] }
    );

    secondUser.setRole(userRole);
  } catch (error) {
    console.log({ error });
  }

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
  //       { fields: ['id', 'updated_at', 'created_at'] }
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
  //         [sequelize.fn('max', sequelize.col('message.created_at')), 'DESC'],
  //         [models.User, 'updated_at', 'DESC'],
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
  // try {
  //   const user = await models.User.create({ username: 'ivan' });
  //   console.log(JSON.stringify(user));
  //   console.log(user.username); // from getter function
  //   console.log(user.getDataValue('username')); // from database
  //   console.log(user.usernameWithId);

  //   const message = await models.Message.create({
  //     text: 'FORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSENFORSEN',
  //     user_id: user.getDataValue('id'),
  //   });

  //   console.log(message.text); // from get()
  //   console.log(message.getDataValue('text')); // from db

  //   const testUser = await models.User.create({ username: 'test' });
  //   console.log(JSON.stringify(testUser));
  // } catch (error) {
  //   console.log({ error });
  // }
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
