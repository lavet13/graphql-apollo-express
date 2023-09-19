import {
  Sequelize,
  DataTypes,
  ModelStatic,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional,
} from 'sequelize';

import { Models } from '.';
import { UserModel } from './user.models';

export interface RoleModel
  extends Model<
    InferAttributes<RoleModel>,
    InferCreationAttributes<RoleModel>
  > {
  id: CreationOptional<string>;
  name: string;
  user: CreationOptional<Partial<UserModel>[]>;
}

export type Role = ModelStatic<RoleModel> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Role: Role = sequelize.define(
    'role',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING('50'),
        unique: true,
      },
    },
    { freezeTableName: true, underscored: true, timestamps: false }
  );

  Role.associate = ({ User }) => {
    Role.hasOne(User);
  };

  return Role;
};
