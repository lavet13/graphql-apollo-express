import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';

import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import Message from './message.models';
import UserRole from './user_role.models';
import Role from './role.models';

@Table({
  modelName: 'User',
  tableName: 'user',
  freezeTableName: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user: User) => {
      user.password = await user.generatePasswordHash();
    },
  },
})
export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,

    validate: {
      notNull: {
        msg: 'Имя пользователя не может быть Null!',
      },
      notEmpty: {
        msg: 'Имя пользователя не может быть пустым!',
      },
    },
  })
  declare username: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notNull: { msg: 'E-mail не может быть Null!' },
      notEmpty: { msg: 'E-mail не может быть пустым!' },

      isEmail: {
        msg: 'Неверный формат E-mail',
      },
    },
  })
  declare email: string;

  @Column({
    type: DataType.TEXT,
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
  })
  declare password: string;

  @HasMany(() => Message, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: { allowNull: false },
  })
  messages: CreationOptional<Message[]>;

  @BelongsToMany(() => Role, () => UserRole)
  roles: CreationOptional<Role[]>;

  async validatePassword(password: string) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.log({ bcryptCompare: error });

      throw new GraphQLError('Internal server error!', {
        extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
      });
    }
  }

  async generatePasswordHash() {
    const saltRounds = 10;

    try {
      return await bcrypt.hash(this.password, saltRounds);
    } catch (error) {
      console.log({ bcryptHash: error });

      throw new GraphQLError('Internal server error!', {
        extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
      });
    }
  }

  static async findByLogin(login: string) {
    let user = await User.findOne({
      where: { username: login },
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login },
      });
    }

    return user;
  }
}

export type UserModel = User;
