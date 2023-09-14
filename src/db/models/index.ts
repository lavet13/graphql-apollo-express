import { Sequelize } from 'sequelize';
import cls from 'cls-hooked';
import UserModel, { User } from './user.models';
import MessageModel, { Message } from './message.models';
import ShipModel, { Ship } from './ship.models';
import CaptainModel, { Captain } from './captain.models';
import FooModel, { Foo } from './foo.models';
import BarModel, { Bar } from './bar.models';
import Foo_BarModel, { Foo_Bar } from './foo_bar.models';

export const namespace = cls.createNamespace('my-namespace');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(
  import.meta.env.VITE_DATABASE,
  import.meta.env.VITE_DATABASE_USER,
  import.meta.env.VITE_DATABASE_PASSWORD,
  {
    dialect: 'postgres',
  }
);

export const t = await sequelize.transaction();

export type Models = {
  User: User;
  Message: Message;
  Ship: Ship;
  Captain: Captain;
  Foo: Foo;
  Bar: Bar;
  Foo_Bar: Foo_Bar;
};

const models = {
  User: UserModel(sequelize),
  Message: MessageModel(sequelize),
  Ship: ShipModel(sequelize),
  Captain: CaptainModel(sequelize),
  Foo: FooModel(sequelize),
  Bar: BarModel(sequelize),
  Foo_Bar: Foo_BarModel(sequelize),
};

(Object.keys(models) as (keyof typeof models)[]).forEach(key => {
  const model = models[key];

  if (model.associate !== undefined) {
    model.associate(models);
  }
});

export { sequelize };

export default models;
