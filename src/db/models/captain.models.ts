import { Sequelize, DataTypes, ModelStatic } from 'sequelize';
import { Models } from '.';

export type Captain = ModelStatic<any> & {
  associate?: (models: Models) => void;
};

export default (sequelize: Sequelize) => {
  const Captain: Captain = sequelize.define(
    'captain',
    {
      name: {
        type: DataTypes.TEXT,
        unique: true,
        validate: { notEmpty: true },
      },
    },
    { timestamps: false, freezeTableName: true }
  );

  Captain.associate = models => {
    Captain.hasOne(models.Ship, {
      sourceKey: 'name',
      foreignKey: 'captain_name',
    });
  };

  return Captain;
};
