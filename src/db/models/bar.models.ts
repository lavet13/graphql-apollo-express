import { Sequelize, ModelStatic, DataTypes } from 'sequelize';
import { Models } from '.';

export type Bar = ModelStatic<any> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Bar: Bar = sequelize.define(
    'bar',
    { title: { type: DataTypes.TEXT } },
    { timestamps: false, freezeTableName: true }
  );

  Bar.associate = models => {
    Bar.belongsToMany(models.Foo, {
      through: { model: models.Foo_Bar, unique: false },
      foreignKey: 'bar_id',
    });
  };

  return Bar;
};
