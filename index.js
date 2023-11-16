/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import 'react-native-get-random-values';
import 'reflect-metadata';

import { dataSource } from './src/data-sources/data-source';

const connectDataSource = async () => {
  if (!dataSource.isInitialized) await dataSource.initialize();
};
connectDataSource();

AppRegistry.registerComponent(appName, () => App);
