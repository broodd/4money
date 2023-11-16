import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CategoriesScreen } from './src/screens/Categories/CategoriesScreen';
import { AccountsScreen } from './src/screens/Accounts/AccountsScreen';

import { SafeAreaView } from 'react-native';

import { QueryClient, QueryClientProvider } from 'react-query';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Tab.Navigator initialRouteName="Accounts" screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Accounts" component={AccountsScreen} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </QueryClientProvider>
  );
}

export default App;
