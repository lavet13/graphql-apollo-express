import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';

import User from './user.models';
import UserRole from './user_role.models';

@Table({
  freezeTableName: true,
  timestamps: false,
  modelName: 'Role',
  tableName: 'role',
  underscored: true,
})
export default class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  @Column({
    type: DataType.STRING('50'),
    unique: true,
  })
  declare name: string;

  @BelongsToMany(() => User, () => UserRole)
  users: CreationOptional<User[]>;
}

export type RoleModel = Role;
