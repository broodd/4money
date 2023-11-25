import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQuery } from 'react-query';
import { PieChart } from 'react-native-chart-kit';

import { categoriesService, accountsService } from '../../data-sources/data-source';
import { getDatesByTypePeriod, getPrevOrNextDateByCurrent } from '../../common/helpers';
import { CreateOrUpdateCategoryModal } from './CreateUpdateCategoryScreen';
import { SelectCategoriesDto } from '../../dto/select-categoris.dto';
import { CategoryTypeEnum } from '../../enums/category-type.enum';
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

export const CategoriesScreen = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryEntity>(
    new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }),
  );
  const [type, setType] = useState<TypePeriodEnum>(TypePeriodEnum.month);
  const [date, setDate] = useState<Date>(today);

  const data = [
    {
      name: 'Seoul',
      population: 21500000,
      color: 'rgba(131, 167, 234, 1)',
    },
    {
      name: 'Toronto',
      population: 2800000,
      color: '#F00',
    },
    {
      name: 'Beijing',
      population: 527612,
      color: 'red',
    },
    {
      name: 'New York',
      population: 8538000,
      color: '#ffffff',
    },
    {
      name: 'Moscow',
      population: 11920000,
      color: 'rgb(0, 0, 255)',
    },
  ];

  const { data: categories = [] } = useQuery(
    'categories',
    async () => await categoriesService.selectMany(),
  );
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

  const handleClickEdit = (category: CategoryEntity) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleClickCreate = () => {
    setSelectedCategory(new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }));
    setIsModalOpen(true);
  };

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

      {slides.map((slide, index) => (
        <Text key={index}>{slide.date.toDateString()}</Text>
      ))}

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
            <PieChart
              data={data}
              width={300}
              height={200}
              hasLegend={false}
              chartConfig={{
                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />

            {slide.categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                onPress={() => handleClickEdit(category)}
              >
                <Text>{category.name}</Text>
                <Text>{category.transactionsTotal}</Text>
                <Text>{category.transactionsCount}</Text>
              </TouchableOpacity>
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
