import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { transformDateByTypePeriod } from '../common/helpers';
import { TypePeriodEnum } from '../enums';

export const PeriodToolbar = ({
  date,
  typePeriod,
  onPrev,
  onNext,
}: {
  typePeriod: TypePeriodEnum;
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
        paddingHorizontal: 15,
      }}
    >
      <TouchableOpacity onPress={onPrev}>
        <Text style={{ fontSize: 25, lineHeight: 25, fontWeight: 'bold' }}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 18 }}>{transformDateByTypePeriod[typePeriod](date)}</Text>
      <TouchableOpacity onPress={onNext}>
        <Text style={{ fontSize: 25, lineHeight: 25, fontWeight: 'bold' }}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );
};
