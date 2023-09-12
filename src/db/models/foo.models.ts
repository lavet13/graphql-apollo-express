import { Sequelize, ModelStatic, DataTypes } from 'sequelize';
import { Models } from '.';

export type Foo = ModelStatic<any> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Foo: Foo = sequelize.define(
    'foo',
    { name: { type: DataTypes.TEXT } },
    { timestamps: false, freezeTableName: true }
  );

  Foo.associate = models => {
    Foo.belongsToMany(models.Bar, {
      through: { model: models.Foo_Bar, unique: false },
      foreignKey: 'foo_id',
    });
  };

  return Foo;
};
