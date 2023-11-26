import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQuery } from 'react-query';
import PieChart from 'react-native-pie-chart';

import { categoriesService, accountsService } from '../../data-sources/data-source';
import { getDatesByTypePeriod, getPrevOrNextDateByCurrent } from '../../common/helpers';
import { CreateOrUpdateCategoryModal } from './CreateUpdateCategoryScreen';
import { SelectCategoriesDto } from '../../dto/select-categoris.dto';
import { CategoryTypeEnum, CategoryTypeNameEnum } from '../../enums/category-type.enum';
import { SelectTransactionsDto } from '../../dto/transactions';
import { Slider } from '../../components/Slider';
import { CategoryEntity } from '../../entities';
import { TypePeriodEnum } from '../../enums';

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
  const [chartDimensions, setChartDimensions] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryEntity>(
    new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }),
  );
  const [type, setType] = useState<TypePeriodEnum>(TypePeriodEnum.month);
  const [categoriesType, setCategoriesType] = useState<CategoryTypeEnum>(CategoryTypeEnum.EXPENSE);
  const [date, setDate] = useState<Date>(today);

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

  const { data: categoriesSlides = [] } = useQuery('categoriesSlides', () => initialize);
  const { data: accounts = [] } = useQuery(
    'accounts',
    async () => await accountsService.selectMany(),
  );

  const createOrEditMutation = useMutation(
    async (entityLike: Partial<CategoryEntity>) => await categoriesService.createOne(entityLike),
    { onSuccess: () => initialize(date) },
  );
  const deleteMutation = useMutation(
    async (conditions: Partial<CategoryEntity>) => await categoriesService.deleteOne(conditions),
    { onSuccess: () => initialize(date) },
  );

  const initialize = async (currentDate: Date = today): Promise<void> => {
    const dates = [
      getPrevOrNextDateByCurrent.prev[type](currentDate),
      today,
      getPrevOrNextDateByCurrent.next[type](currentDate),
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

    setSlides(
      promises.map((categories, index) => ({
        date: dates[index],
        categories,
      })),
    );
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
    setSlides((prevState) => [{ date: selectedDate, categories }, ...prevState]);
  };

  const handleSlideNext = async (selectedDate) => {
    const options = new SelectCategoriesDto({
      transactionsOptions: new SelectTransactionsDto({
        date: getDatesByTypePeriod[type](selectedDate),
      }),
      order: { createdAt: 'desc' },
    });
    const categories = await categoriesService.selectManyWithTotal(options);
    setSlides((prevState) => [...prevState, { date: selectedDate, categories }]);
  };

  useEffect(() => {
    initialize();
  }, []);

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
          <Text>{isEditMode ? 'Close' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <Slider
        slides={slides}
        type={type}
        date={date}
        onChangeDate={(value) => setDate(value)}
        onPrev={handleSlidePrev}
        onNext={handleSlideNext}
      >
        {slides.map((slide, slideIndex) => (
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
                  coverRadius={0.45}
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

            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
              }}
            >
              {slide.categories
                .filter((category) => category.type === categoriesType)
                .map((category, index) => (
                  <TouchableOpacity
                    style={{ width: '25%', alignItems: 'center', marginVertical: 10 }}
                    key={index}
                    onPress={() => handleClickEdit(category)}
                  >
                    <Text>{category.name}</Text>
                    <Text>{category.transactionsTotal}</Text>
                  </TouchableOpacity>
                ))}
            </View>

            {slides.map((slide, index) => (
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
