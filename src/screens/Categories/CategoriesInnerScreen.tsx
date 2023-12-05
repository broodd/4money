import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import PieChart from 'react-native-pie-chart';

import { CategoryTypeEnum, CategoryTypeNameEnum } from '../../enums/category-type.enum';
import { Slide } from '../CategoriesTransactionsScreen';
import { CategoriesList } from './CategoriesList';
import { CategoryEntity } from '../../entities';

const today = new Date();
today.setHours(0, 0, 0, 0);

const dynamicColors = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

export const CategoriesInnerScreen = ({
  slide,
  categoriesType,
  onChangeCategoryType,
  onPressCategory,
}: {
  slide: Slide;
  categoriesType: CategoryTypeEnum;
  onChangeCategoryType: (type) => void;
  onPressCategory: (category: CategoryEntity, isLongPress?: boolean) => void;
}) => {
  const [chartDimensions, setChartDimensions] = useState(0);

  const categoriesByType = slide.categories.filter(
    (category) => category.type === categoriesType && category.transactionsTotal,
  );
  const totalsArray = categoriesByType.length
    ? categoriesByType.map((category) => category.transactionsTotal)
    : [1];
  const colorsArray = categoriesByType.length
    ? categoriesByType.map((category) => category.color)
    : ['lightgray'];

  return (
    <ScrollView>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}
        onPress={() =>
          onChangeCategoryType(
            categoriesType === CategoryTypeEnum.EXPENSE
              ? CategoryTypeEnum.INCOME
              : CategoryTypeEnum.EXPENSE,
          )
        }
      >
        <View
          style={{ width: '50%', alignItems: 'center' }}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setChartDimensions(width);
          }}
        >
          <PieChart
            widthAndHeight={chartDimensions - 30}
            series={totalsArray}
            sliceColor={colorsArray}
            // coverRadius={0.5}
            // coverFill="white"
          />
        </View>
        <View style={{ width: '50%', alignItems: 'center' }}>
          <Text style={{ fontSize: 22 }}>
            {CategoryTypeNameEnum[CategoryTypeEnum[categoriesType]]}
          </Text>
          <Text style={{ color: 'tomato', fontSize: 20, fontWeight: 'bold' }}>
            {slide.categories
              .filter((category) => category.type === CategoryTypeEnum.EXPENSE)
              .reduce((acc, current) => ((acc += current.transactionsTotal), acc), 0)}
          </Text>
          <Text style={{ color: '#8ADAB2', fontSize: 20, fontWeight: 'bold' }}>
            {slide.categories
              .filter((category) => category.type === CategoryTypeEnum.INCOME)
              .reduce((acc, current) => ((acc += current.transactionsTotal), acc), 0)}
          </Text>
        </View>
      </TouchableOpacity>

      <CategoriesList
        categories={slide.categories.filter((category) => category.type === categoriesType)}
        onPress={onPressCategory}
      />
    </ScrollView>
  );
};
