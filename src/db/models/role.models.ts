import {
  Sequelize,
  DataTypes,
  ModelStatic,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { Models } from '.';

export interface RoleModel
  extends Model<
    InferAttributes<RoleModel>,
    InferCreationAttributes<RoleModel>
  > {
  [key: string]: any;
  id: string;
  name: string;
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
        allowNull: false,
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
