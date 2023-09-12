import { Sequelize, ModelStatic, DataTypes } from 'sequelize';
import { Models } from '.';

export type Foo_Bar = ModelStatic<any> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Foo_Bar: Foo_Bar = sequelize.define(
    'foo_bar',
    {
      foo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'foo',
          key: 'id',
        },
      },
      bar_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'bar',
          key: 'id',
        },
      },
    },
    { freezeTableName: true, timestamps: false }
  );

  return Foo_Bar;
};
