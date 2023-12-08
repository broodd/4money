import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AccountsScreen } from './src/screens/Accounts/AccountsScreen';

import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { CategoriesTransactionsScreen } from './src/screens/CategoriesTransactionsScreen';

const queryClient = new QueryClient();

const routes = [{ name: 'Accounts' }, { name: 'Categories' }, { name: 'Transactions' }];

function App() {
  const [selected, setSelected] = useState(routes[2].name);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {selected === 'Accounts' && <AccountsScreen />}
          {(selected === 'Categories' || selected === 'Transactions') && (
            <CategoriesTransactionsScreen route={selected} />
          )}
        </View>
        <View
          style={{
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#94A684',
          }}
        >
          {routes.map((route, index) => (
            <TouchableOpacity
              key={route.name}
              style={[
                {
                  flex: 1,
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#F3EEEA',
                  borderRightWidth: 1,
                },
                selected === route.name && { backgroundColor: '#527853' },
                index === routes.length - 1 && { borderRightWidth: 0 },
              ]}
              onPress={() => setSelected(route.name)}
            >
              <Text
                style={[
                  { color: 'white', fontSize: 16 },
                  selected === route.name && { color: 'white' },
                ]}
              >
                {route.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </QueryClientProvider>
  );
}

export default App;
