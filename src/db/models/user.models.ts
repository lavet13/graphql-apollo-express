import {
  Sequelize,
  DataTypes,
  ModelStatic,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import { Models } from '.';

export interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  [key: string]: any;
  id: CreationOptional<string>;
  username: string;
  // usernameWithId: string;
  createdAt: Date;
  updatedAt: Date;
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
    },
    { freezeTableName: true, underscored: true }
  );

  User.associate = ({ Message }) => {
    User.hasMany(Message, { onDelete: 'CASCADE', foreignKey: 'user_id' });
  };

  User.findByLogin = async (login: string) => {
    let user = await User.findOne({
      where: { username: login },
    });

    // if (!user) {
    //       user = await User.findOne({
    //         where: { email: login },
    //       });
    //     }

    return user;
  };

  return User;
};
