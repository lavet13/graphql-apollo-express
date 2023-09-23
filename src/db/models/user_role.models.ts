import { InferAttributes, InferCreationAttributes } from 'sequelize';

import {
  Table,
  Column,
  ForeignKey,
  Model,
  DataType,
} from 'sequelize-typescript';
import User from './user.models';
import Role from './role.models';

@Table({
  freezeTableName: true,
  modelName: 'UserRole',
  tableName: 'user_role',
  timestamps: false,
  underscored: true,
})
export default class UserRole extends Model<
  InferAttributes<UserRole>,
  InferCreationAttributes<UserRole>
> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare userId: number;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare roleId: number;
}
