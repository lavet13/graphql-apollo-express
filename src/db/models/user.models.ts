import {
  Sequelize,
  DataTypes,
  ModelStatic,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import bcrypt from 'bcryptjs';

import { Models } from '.';

import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { RoleModel } from './role.models';
import { MessageModel } from './message.models';

export interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  id: CreationOptional<string>;
  username: string;
  email: string;
  password: string;
  roleId: CreationOptional<number>;
  // usernameWithId: string;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;

  messages: CreationOptional<Partial<MessageModel>[]>;
  setRole: (role: RoleModel) => void;
  generatePasswordHash: () => Promise<string>;
  validatePassword: (password: string) => Promise<boolean>;
}

export type User = ModelStatic<UserModel> & {
  associate?: (models: Models) => void;
  findByLogin?: (login: string) => Promise<any | null>;
};

export default (sequelize: Sequelize) => {
  const User: User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Имя пользователя не может быть Null!',
          },
          notEmpty: {
            msg: 'Имя пользователя не может быть пустым!',
          },
          // containsSomething(value: string) {
          //   if (value.includes('test')) {
          //     throw new Error('AGAAAAA!!!!!!!!!!');
          //   }
          // },
        },
        // get() {
        //   const rawValue = this.getDataValue('username');
        //   const newValue = rawValue.replace(/!+/i, '');
        //   return `${newValue.toUpperCase()}: ${this.id}`;
        // },

        // set(value: string) {
        //   this.setDataValue('username', value + '!!');
        // },
      },

      // usernameWithId: {
      //   type: DataTypes.VIRTUAL,

      //   get() {
      //     return `${this.id}: ${this.getDataValue('username')}`;
      //   },

      //   set(_: string) {
      //     throw new Error(`Do not try to set the \`usernameWithId\` value!`);
      //   },
      // },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: 'E-mail не может быть пустым!',
          },
          isEmail: {
            msg: 'Неверный формат E-mail',
          },
        },
      },

      password: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Пароль не может быть Null',
          },

          notEmpty: {
            msg: 'Пароль не может быть пуст!',
          },

          len: {
            args: [7, 42],
            msg: 'Пароль пользователя должен содержать от 7 до 42 символов',
          },
        },
      },
    },
    {
      freezeTableName: true,
      underscored: true,
    }
  );

  User.beforeCreate(async (user, _) => {
    user.password = await user.generatePasswordHash();
  });

  User.prototype.validatePassword = async function (password: string) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.log({ bcryptCompare: error });

      throw new GraphQLError('Internal server error!', {
        extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
      });
    }
  };

  User.prototype.generatePasswordHash = async function () {
    const saltRounds = 10;

    try {
      return await bcrypt.hash(this.password, saltRounds);
    } catch (error) {
      console.log({ bcryptHash: error });

      throw new GraphQLError('Internal server error!', {
        extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
      });
    }
  };

  User.associate = ({ Message, Role }) => {
    User.hasMany(Message, {
      onDelete: 'CASCADE',
      foreignKey: { allowNull: false },
    });

    User.belongsTo(Role);
  };

  User.findByLogin = async (login: string) => {
    let user = await User.findOne({
      where: { username: login },
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login },
      });
    }

    return user;
  };

  return User;
};
