import React, { useEffect } from 'react';
import { Button, SafeAreaView } from 'react-native';
import { dataSource } from './src/Database';
import { experiment } from './src/Actions';

function App() {
  useEffect(() => {
    const connect = async () => {
      if (!dataSource.isInitialized) await dataSource.initialize();
    };

    connect();
  }, []);

  return (
    <SafeAreaView>
      <Button title="Experiment one" onPress={() => experiment(1)} />
      <Button title="Experiment 10" onPress={() => experiment(10)} />
      <Button title="Experiment 10000" onPress={() => experiment(10000)} />
    </SafeAreaView>
  );
}

export default App;
