import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CategoryEntity } from '../../entities';

export const CategoriesList = ({
  categories,
  onPress,
}: {
  categories: CategoryEntity[];
  onPress: (category: CategoryEntity, isLongPress?: boolean) => void;
}) => (
  <View
    style={{
      flexWrap: 'wrap',
      flexDirection: 'row',
    }}
  >
    {categories.map((category, index) => (
      <TouchableOpacity
        style={{
          width: '33.33%',
          alignItems: 'center',
          marginVertical: 10,
        }}
        key={index}
        onPress={() => onPress(category)}
        onLongPress={() => onPress(category, true)}
      >
        <View
          style={{
            borderRadius: 50,
            backgroundColor: category.color,
            borderColor: 'lightgray',
            borderWidth: 1,
            width: 30,
            height: 30,
          }}
        ></View>
        <Text style={{ fontSize: 20 }}>{category.name}</Text>
        <Text style={{ fontSize: 23, color: category.color }}>{category.transactionsTotal}</Text>
      </TouchableOpacity>
    ))}
  </View>
);
