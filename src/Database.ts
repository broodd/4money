import { typeORMDriver } from 'react-native-quick-sqlite';
import { DataSource } from 'typeorm';
import { Person } from './Person';

export const dataSource = new DataSource({
  name: 'default',
  database: 'quicksqlitetest-typeorm.db',
  entities: [Person],
  location: '.',
  logging: true,
  synchronize: true,
  type: 'react-native',
  driver: typeORMDriver,
});

export const PersonRepository = dataSource.getRepository(Person);
