import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { transformDateByTypePeriod } from '../common/helpers';
import { TypePeriodEnum } from '../enums';

export const PeriodToolbar = ({
  date,
  type,
  onPrev,
  onNext,
}: {
  type: TypePeriodEnum;
  date: Date;
  onPrev: (date) => void;
  onNext: (date) => void;
}) => {
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
