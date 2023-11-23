import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { transformDateByTypePeriod } from '../common/helpers';

export const PeriodToolbar = ({ date, type, onPrev, onNext }) => {
  return (
    <View
      style={{
        height: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <TouchableOpacity onPress={onPrev}>
        <Text>Prev</Text>
      </TouchableOpacity>
      <Text>{transformDateByTypePeriod[type](date)}</Text>
      <TouchableOpacity onPress={onNext}>
        <Text>Next</Text>
      </TouchableOpacity>
    </View>
  );
};
