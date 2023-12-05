import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  TransactionsGroup,
  getDatesByTypePeriod,
  getPrevOrNextDateByCurrent,
  groupTransactionsByDate,
} from '../common/helpers';
import {
  accountsService,
  categoriesService,
  transactionsService,
} from '../data-sources/data-source';
import { CreateOrUpdateTransactionModal } from './Transactions/CreateUpdateTransactionModal';
import { CreateOrUpdateCategoryModal } from './Categories/CreateUpdateCategoryScreen';
import { TransactionsInnerScreen } from './Transactions/TransactionsInnerScreen';
import { CategoriesInnerScreen } from './Categories/CategoriesInnerScreen';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';
import { SelectCategoriesDto } from '../dto/select-categoris.dto';
import { CategoryEntity, TransactionEntity } from '../entities';
import { CategoryTypeEnum } from '../enums/category-type.enum';
import { SelectTransactionsDto } from '../dto/transactions';
import { Slider } from '../components/Slider';
import { TypePeriodEnum } from '../enums';

export interface Slide {
  transactionsGroups: TransactionsGroup[];
  categories: CategoryEntity[];
  date: Date;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

export const CategoriesTransactionsScreen = ({ route }: { route: string }) => {
  const [date, setDate] = useState<Date>(today);

  const { data: accounts } = useQuery('accounts', () =>
    accountsService.selectMany({ order: { createdAt: 'desc' } }),
  );

  const [categoriesType, setCategoriesType] = useState<CategoryTypeEnum>(CategoryTypeEnum.EXPENSE);
  const typePeriod = TypePeriodEnum.month;
  // const [typePeriod, setTypePeriod] = useState<TypePeriodEnum>(TypePeriodEnum.month);

  const handleSlidePrev = async (selectedDate: Date) => {
    const slide = await getCategoriesAndTransactionsByDate(selectedDate);
    const data = [slide, ...slides];
    setSlides(data);
  };

  const handleSlideNext = async (selectedDate: Date) => {
    const slide = await getCategoriesAndTransactionsByDate(selectedDate);
    const data = [...slides, slide];
    setSlides(data);
  };

  const getCategoriesAndTransactionsByDate = async (selectedDate: Date): Promise<Slide> => {
    const period = getDatesByTypePeriod[typePeriod](selectedDate);

    const transactions = await transactionsService.selectMany(
      new SelectTransactionsDto({
        date: period,
        order: { date: 'desc', createdAt: 'desc' },
      }),
    );
    const transactionsGroups = groupTransactionsByDate(transactions);

    const categories = await categoriesService.selectManyWithTotal(
      new SelectCategoriesDto({
        transactionsOptions: new SelectTransactionsDto({
          date: period,
        }),
        order: { createdAt: 'desc' },
      }),
    );

    return { categories, transactionsGroups, date: selectedDate };
  };

  const initialize = async (): Promise<void> => {
    const dates = [
      getPrevOrNextDateByCurrent.prev[typePeriod](date),
      date,
      getPrevOrNextDateByCurrent.next[typePeriod](date),
    ];

    const promises = await Promise.all(dates.map(getCategoriesAndTransactionsByDate));

    setSlides(
      promises.map((data, index) => ({
        date: dates[index],
        categories: data.categories,
        transactionsGroups: data.transactionsGroups,
      })),
    );
  };

  const [slides, setSlides] = useState([]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryEntity>(
    new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }),
  );

  const handleChangeCategoriesType = (type) => setCategoriesType(type);

  const handlePressCategory = (category: CategoryEntity, isLongPress: boolean) => {
    if (isEditMode || isLongPress) {
      setSelectedCategory(category);
      setIsCategoryModalOpen(true);
    } else {
      setSelectedCategory(category);
      setIsTransactionModalOpen(true);
    }
  };

  const handlePressCreateCategory = () => {
    setSelectedCategory(new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }));
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (entityLike: Partial<CategoryEntity>) => {
    await categoriesService.createOne(entityLike);
    await initialize();
    setIsEditMode(false);
  };

  const handleDeleteCategory = async (entityLike: Partial<CategoryEntity>) => {
    await categoriesService.deleteOne(entityLike);
    await initialize();
    setIsEditMode(false);
  };

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionEntity>(
    new TransactionEntity({ type: TransactionTypeEnum.EXPENSE, amount: 0 }),
  );

  const handleSaveTransaction = async (entityLike: Partial<TransactionEntity>) => {
    await transactionsService.createOne(entityLike);
    await initialize();
    setIsTransactionModalOpen(false);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 15,
        }}
      >
        <Text style={{ fontSize: 22 }}>
          {accounts?.reduce((acc, current) => (acc += current.balance), 0)}
        </Text>
        {isEditMode && (
          <TouchableOpacity onPress={handlePressCreateCategory}>
            <Text style={{ fontSize: 22 }}>Add</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
          <Text style={{ fontSize: 22 }}>{isEditMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {slides?.length ? (
          <Slider
            date={date}
            slides={slides}
            typePeriod={typePeriod}
            onChangeDate={setDate}
            onPrev={handleSlidePrev}
            onNext={handleSlideNext}
          >
            {slides.map((slide, slideIndex) =>
              route === 'Categories' ? (
                <CategoriesInnerScreen
                  slide={slide}
                  key={slideIndex}
                  categoriesType={categoriesType}
                  onChangeCategoryType={handleChangeCategoriesType}
                  onPressCategory={handlePressCategory}
                />
              ) : (
                <TransactionsInnerScreen slide={slide} key={slideIndex} />
              ),
            )}
          </Slider>
        ) : null}
      </View>

      <CreateOrUpdateCategoryModal
        isOpen={isCategoryModalOpen}
        initialCategory={selectedCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <CreateOrUpdateTransactionModal
        isOpen={isTransactionModalOpen}
        date={date}
        accounts={accounts}
        categories={slides[0]?.categories}
        initialCategory={selectedCategory}
        initialTransaction={selectedTransaction}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={null}
      />
    </View>
  );
};
