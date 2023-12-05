import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import PieChart from 'react-native-pie-chart';

import { getDatesByTypePeriod, getPrevOrNextDateByCurrent } from '../../common/helpers';
import { CategoryTypeEnum, CategoryTypeNameEnum } from '../../enums/category-type.enum';
import { accountsService, categoriesService } from '../../data-sources/data-source';
import { CreateOrUpdateCategoryModal } from './CreateUpdateCategoryScreen';
import { SelectCategoriesDto } from '../../dto/select-categoris.dto';
import { SelectTransactionsDto } from '../../dto/transactions';
import { CategoriesList } from './CategoriesList';
import { Slider } from '../../components/Slider';
import { CategoryEntity } from '../../entities';
import { TypePeriodEnum } from '../../enums';
import { useDate } from '../../common/store';

interface Slide {
  categories: CategoryEntity[];
  date: Date;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const dynamicColors = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
};

export const CategoriesScreen = () => {
  const queryClient = useQueryClient();
  const [chartDimensions, setChartDimensions] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryEntity>(
    new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }),
  );
  const [type, setType] = useState<TypePeriodEnum>(TypePeriodEnum.month);
  const [categoriesType, setCategoriesType] = useState<CategoryTypeEnum>(CategoryTypeEnum.EXPENSE);

  const { data: date } = useDate();
  const { data: categoriesSlides = [] } = useQuery(
    'categoriesSlides',
    async () => await initialize(),
  );
  const { data: accounts } = useQuery('accounts', async () => await accountsService.selectMany());

  const createOrEditMutation = useMutation(
    async (entityLike: Partial<CategoryEntity>) => await categoriesService.createOne(entityLike),
    { onSuccess: () => queryClient.invalidateQueries(['categoriesSlides', 'transactionsSlides']) },
  );
  const deleteMutation = useMutation(
    async (conditions: Partial<CategoryEntity>) => await categoriesService.deleteOne(conditions),
    { onSuccess: () => queryClient.invalidateQueries(['categoriesSlides', 'transactionsSlides']) },
  );

  const getChartCategoriesData = (categories: Partial<CategoryEntity>[]) => {
    const categoriesByType = categories.filter((category) => category.type === categoriesType);
    const data = categoriesByType.map((category) => category.transactionsTotal);
    if (data.every((value) => !value)) return [1];
    return data;
  };

  const getChartCategoriesColors = (categories: Partial<CategoryEntity>[]) => {
    const categoriesByType = getChartCategoriesData(categories);
    const data = categoriesByType.map(() => dynamicColors());
    return data;
  };

  const initialize = async (): Promise<Slide[]> => {
    const dates = [
      getPrevOrNextDateByCurrent.prev[type](date),
      date,
      getPrevOrNextDateByCurrent.next[type](date),
    ];

    const promises = await Promise.all(
      dates.map((d) =>
        categoriesService.selectManyWithTotal(
          new SelectCategoriesDto({
            transactionsOptions: new SelectTransactionsDto({
              date: getDatesByTypePeriod[type](d),
            }),
            order: { createdAt: 'desc' },
          }),
        ),
      ),
    );

    return promises.map((categories, index) => ({
      date: dates[index],
      categories,
    }));
  };

  const handleClickEdit = (category: CategoryEntity) => {
    if (isEditMode) {
      setSelectedCategory(category);
      setIsModalOpen(true);
    }
  };

  const handleClickCreate = () => {
    setSelectedCategory(new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }));
    setIsModalOpen(true);
  };

  const handleSlidePrev = async (selectedDate) => {
    const options = new SelectCategoriesDto({
      transactionsOptions: new SelectTransactionsDto({
        date: getDatesByTypePeriod[type](selectedDate),
      }),
      order: { createdAt: 'desc' },
    });
    const categories = await categoriesService.selectManyWithTotal(options);
    const data = [{ date: selectedDate, categories }, ...categoriesSlides];
    queryClient.setQueryData<Slide[]>('categoriesSlides', data);
  };

  const handleSlideNext = async (selectedDate) => {
    const options = new SelectCategoriesDto({
      transactionsOptions: new SelectTransactionsDto({
        date: getDatesByTypePeriod[type](selectedDate),
      }),
      order: { createdAt: 'desc' },
    });
    const categories = await categoriesService.selectManyWithTotal(options);
    const data = [...categoriesSlides, { date: selectedDate, categories }];
    queryClient.setQueryData<Slide[]>('categoriesSlides', data);
  };

  return (
    <View>
      <View
        style={{
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            return;
          }}
        >
          <Text>Menu</Text>
        </TouchableOpacity>
        <Text>{accounts.reduce((acc, current) => (acc += current.balance), 0)}</Text>
        {isEditMode && (
          <TouchableOpacity onPress={handleClickCreate}>
            <Text>Add</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
          <Text>{isEditMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <Slider
        slides={categoriesSlides}
        typePeriod={type}
        date={date}
        onChangeDate={(value) => {
          console.log('--- date', date);
          queryClient.setQueryData('date', value);
        }}
        onPrev={handleSlidePrev}
        onNext={handleSlideNext}
      >
        {categoriesSlides.map((slide, slideIndex) => (
          <ScrollView key={slideIndex}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
              <TouchableOpacity
                style={{ width: '50%', alignItems: 'center' }}
                onPress={() =>
                  setCategoriesType((prevType) =>
                    prevType === CategoryTypeEnum.EXPENSE
                      ? CategoryTypeEnum.INCOME
                      : CategoryTypeEnum.EXPENSE,
                  )
                }
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setChartDimensions(width);
                }}
              >
                <PieChart
                  widthAndHeight={chartDimensions - 30}
                  series={getChartCategoriesData(slide.categories)}
                  sliceColor={getChartCategoriesColors(slide.categories)}
                  coverFill="transparent"
                />
              </TouchableOpacity>
              <View style={{ width: '50%', alignItems: 'center' }}>
                <Text>{CategoryTypeNameEnum[CategoryTypeEnum.EXPENSE]}</Text>
                <Text>
                  {slide.categories
                    .filter((category) => category.type === CategoryTypeEnum.EXPENSE)
                    .reduce((acc, current) => ((acc += current.transactionsTotal), acc), 0)}
                </Text>
                <Text>{CategoryTypeNameEnum[CategoryTypeEnum.INCOME]}</Text>
                <Text>
                  {slide.categories
                    .filter((category) => category.type === CategoryTypeEnum.INCOME)
                    .reduce((acc, current) => ((acc += current.transactionsTotal), acc), 0)}
                </Text>
              </View>
            </View>

            <CategoriesList
              categories={slide.categories.filter((category) => category.type === categoriesType)}
              onPress={(category) => handleClickEdit(category)}
            />

            {categoriesSlides.map((slide, index) => (
              <Text key={index}>{slide.date.toDateString()}</Text>
            ))}
          </ScrollView>
        ))}
      </Slider>

      <CreateOrUpdateCategoryModal
        isOpen={isModalOpen}
        initialCategory={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => createOrEditMutation.mutateAsync(data)}
        onDelete={(data) => deleteMutation.mutateAsync(data)}
      />
    </View>
  );
};
