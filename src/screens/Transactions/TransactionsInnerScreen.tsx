import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Slide } from '../CategoriesTransactionsScreen';

export const TransactionsInnerScreen = ({ slide }: { slide: Slide }) => {
  return (
    <ScrollView>
      {slide.transactionsGroups.map((group, index) => (
        <View key={index}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{group.date}</Text>
            <Text>{group.total}</Text>
          </View>

          {group.transactions.map((transaction, index) => (
            <TouchableOpacity
              key={index}
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text>{transaction.amount}</Text>
              <Text>{transaction.description}</Text>
              <Text>{transaction.categoryId ? 'cat' : ''}</Text>
              <Text>{transaction.date.toISOString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};
