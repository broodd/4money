import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Slide } from '../CategoriesTransactionsScreen';
import { CategoryTypeEnum } from '../../enums/category-type.enum';
import { TransactionEntity } from '../../entities';

export const TransactionsInnerScreen = ({
  slide,
  onPressTransaction,
}: {
  slide: Slide;
  onPressTransaction: (category: TransactionEntity) => void;
}) => {
  if (!slide.transactionsGroups.length)
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Text style={{ fontSize: 22 }}>No transactions</Text>
      </View>
    );

  return (
    <ScrollView>
      {slide.transactionsGroups.map((group, index) => (
        <View key={index}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F3EEEA',
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderColor: 'lightgray',
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>{group.date.slice(0, 10)}</Text>
            <Text style={{ fontSize: 16 }}>{group.total}</Text>
          </View>

          {group.transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              onPress={() => onPressTransaction(transaction)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 5,
                paddingHorizontal: 15,
                borderBottomColor: 'lightgray',
                borderBottomWidth: 1,
              }}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      backgroundColor: transaction.account?.color,
                      borderRadius: 50,
                      marginRight: 5,
                      width: 15,
                      height: 15,
                    }}
                  ></View>
                  <Text style={{ fontSize: 18 }}>{transaction.account?.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      backgroundColor: transaction.category?.color,
                      borderRadius: 50,
                      marginRight: 5,
                      width: 15,
                      height: 15,
                    }}
                  ></View>
                  <Text style={{ fontSize: 18 }}>{transaction.category?.name}</Text>
                </View>
              </View>
              <Text
                style={[
                  { fontSize: 20 },
                  transaction.category?.type === CategoryTypeEnum.EXPENSE
                    ? { color: 'tomato' }
                    : { color: '#527853' },
                ]}
              >
                {transaction.category?.type === CategoryTypeEnum.EXPENSE &&
                  transaction.amount > 0 &&
                  '-'}
                {transaction.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};
