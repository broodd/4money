import { typeORMDriver } from 'react-native-quick-sqlite';
import { DataSource } from 'typeorm';

import { TransactionEntity } from '../entities/transaction.entity';
import { AccountEntity } from '../entities/account.entity';
import { CategoryEntity } from '../entities/category.entity';

export const dataSource = new DataSource({
  name: 'default',
  type: 'react-native',
  driver: typeORMDriver,
  database: 'quicksqlitetest-typeorm.db',
  location: '.',
  entities: [TransactionEntity, AccountEntity, CategoryEntity],
  synchronize: true,
  logging: true,
});
import './polyfill';

import { AccountsService, CategoriesService, TransactionsService } from '../services';
export const transactionsService = new TransactionsService(
  dataSource.getRepository(TransactionEntity),
);
export const accountsService = new AccountsService(dataSource.getRepository(AccountEntity));
export const categoriesService = new CategoriesService(dataSource.getRepository(CategoryEntity));
