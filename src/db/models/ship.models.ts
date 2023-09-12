import { Sequelize, DataTypes, ModelStatic } from 'sequelize';
import { Models } from '.';

export type Ship = ModelStatic<any> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Ship: Ship = sequelize.define(
    'ship',
    {
      name: DataTypes.TEXT,
    },
    { timestamps: false, freezeTableName: true }
  );

  Ship.associate = models => {
    Ship.belongsTo(models.Captain, {
      targetKey: 'name',
      foreignKey: 'captain_name',
    });
  };

  return Ship;
};
