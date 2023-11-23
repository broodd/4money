import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import {
  transactionsService,
  categoriesService,
  accountsService,
} from '../../data-sources/data-source';
import { SelectTransactionsDto, TransactionStatsDto } from '../../dto/transactions';
import { CreateOrUpdateCategoryModal } from './CreateUpdateCategoryScreen';
import { CategoryTypeEnum } from '../../enums/category-type.enum';
import { Slider } from '../../components/Slider';
import { CategoryEntity } from '../../entities';
import { TypePeriodEnum } from '../../enums';
import { getDatesByTypePeriod, getPrevOrNextDateByCurrent } from '../../common/helpers';

interface Slide {
  transactionsStats: Record<string, TransactionStatsDto>;
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

  const { data: categories = [], refetch } = useQuery(
    'categories',
    async () => await categoriesService.selectMany(),
  );
  const { data: accounts = [] } = useQuery(
    'accounts',
    async () => await accountsService.selectMany(),
  );

  const createOrEditMutation = useMutation(
    async (entityLike: Partial<CategoryEntity>) => await categoriesService.createOne(entityLike),
    { onSuccess: () => refetch() },
  );
  const deleteMutation = useMutation(
    async (conditions: Partial<CategoryEntity>) => await categoriesService.deleteOne(conditions),
    { onSuccess: () => refetch() },
  );

  const handleClickEdit = (category: CategoryEntity) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleClickCreate = () => {
    setSelectedCategory(new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }));
    setIsModalOpen(true);
  };

  const initialize = async (): Promise<void> => {
    const dates = [
      getPrevOrNextDateByCurrent.prev[type](date),
      today,
      getPrevOrNextDateByCurrent.next[type](date),
    ];

    const promises = await Promise.all(
      dates.map((d) =>
        transactionsService.selectManyWithTotalAndCount(
          new SelectTransactionsDto({
            date: getDatesByTypePeriod[type](d),
            order: { date: 'desc' },
          }),
        ),
      ),
    );

    setSlides(
      promises.map((transactionsStats, index) => ({
        date: dates[index],
        transactionsStats,
      })),
    );
  };

  const handleSlidePrev = async (selectedDate) => {
    const transactionsOptions = new SelectTransactionsDto({
      date: getDatesByTypePeriod[type](selectedDate),
    });
    const transactionsStats = await transactionsService.selectManyWithTotalAndCount(
      transactionsOptions,
    );
    setSlides((prevState) => [{ date: selectedDate, transactionsStats }, ...prevState]);
  };

  const handleSlideNext = async (selectedDate) => {
    const transactionsOptions = new SelectTransactionsDto({
      date: getDatesByTypePeriod[type](selectedDate),
    });
    const transactionsStats = await transactionsService.selectManyWithTotalAndCount(
      transactionsOptions,
    );
    setSlides((prevState) => [...prevState, { date: selectedDate, transactionsStats }]);
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
            <Text>{slideIndex}</Text>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                onPress={() => handleClickEdit(category)}
              >
                <Text>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ))}
      </Slider>

      <CreateOrUpdateCategoryModal
        isOpen={isModalOpen}
        initialCategory={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => await createOrEditMutation.mutateAsync(data)}
        onDelete={async (data) => await deleteMutation.mutateAsync(data)}
      />
    </View>
  );
};
