// import {
//   DataTypes,
//   InferAttributes,
//   InferCreationAttributes,
//   Model,
//   ModelStatic,
//   CreationOptional,
//   Sequelize,
// } from 'sequelize';

// import { gunzipSync, gzipSync } from 'node:zlib';

// import { Models } from '.';

// export interface MessageModel
//   extends Model<
//     InferAttributes<MessageModel>,
//     InferCreationAttributes<MessageModel>
//   > {
//   [key: string]: any;
//   id: CreationOptional<string>;
//   text: string;
//   createdAt: CreationOptional<Date>;
//   updatedAt: CreationOptional<Date>;
//   userId: CreationOptional<string>;
// }

// export type Message = ModelStatic<MessageModel> & {
//   associate?: (models: Models) => void;
// };

// export default (sequelize: Sequelize) => {
//   const Message: Message = sequelize.define(
//     'message',
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       text: {
//         type: DataTypes.TEXT,
//         validate: {
//           notEmpty: {
//             msg: 'Сообщение не должно быть пусто!',
//           },
//         },

//         get() {
//           const storedValue = this.getDataValue('text');
//           const gzippedBuffer = Buffer.from(storedValue, 'base64');
//           const unzippedBuffer = gunzipSync(gzippedBuffer);
//           return unzippedBuffer.toString();
//         },

//         set(value: string) {
//           const gzippedBuffer = gzipSync(value);
//           this.setDataValue('text', gzippedBuffer.toString('base64'));
//         },
//       },
//     },
//     { freezeTableName: true, underscored: true }
//   );

//   Message.associate = ({ User }) => {
//     Message.belongsTo(User, {
//       foreignKey: { allowNull: false },
//     });
//   };

//   return Message;
// };
import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';

import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

import { gunzipSync, gzipSync } from 'node:zlib';
import User from './user.models';

@Table({
  freezeTableName: true,
  modelName: 'Message',
  tableName: 'message',
  underscored: true,
})
export default class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  @Column({
    type: DataType.TEXT,
    validate: {
      notEmpty: {
        msg: 'Сообщение не должно быть пусто!',
      },
    },
  })
  get text(): string {
    const storedValue = this.getDataValue('text');
    const gzippedBuffer = Buffer.from(storedValue, 'base64');
    const unzippedBuffer = gunzipSync(gzippedBuffer);
    return unzippedBuffer.toString();
  }

  set text(value: string) {
    const gzippedBuffer = gzipSync(value);
    this.setDataValue('text', gzippedBuffer.toString('base64'));
  }

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare userId: CreationOptional<number>;

  @BelongsTo(() => User)
  declare user: CreationOptional<User>;
}

export type MessageModel = Message;
