import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
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
import { CreateOrUpdateCategoryModal } from './Categories/CreateUpdateCategoryModal';
import { TransactionsInnerScreen } from './Transactions/TransactionsInnerScreen';
import { CategoriesInnerScreen } from './Categories/CategoriesInnerScreen';
import { SelectCategoriesDto } from '../dto/select-categoris.dto';
import { AccountEntity, CategoryEntity, TransactionEntity } from '../entities';
import { CategoryTypeEnum } from '../enums/category-type.enum';
import { SelectTransactionsDto } from '../dto/transactions';
import { Slider } from '../components/Slider';
import { TypePeriodEnum } from '../enums';
import { FloatingButton } from '../components/FloatingButton';

export interface Slide {
  transactionsGroups: TransactionsGroup[];
  categories: CategoryEntity[];
  date: Date;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

export const CategoriesTransactionsScreen = ({ route }: { route: string }) => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>(today);

  const { data: accounts } = useQuery('accounts', () =>
    accountsService.selectMany({ order: { createdAt: 'desc' } }),
  );

  const [categoriesType, setCategoriesType] = useState<CategoryTypeEnum>(CategoryTypeEnum.EXPENSE);
  const typePeriod = TypePeriodEnum.month;

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
        loadEagerRelations: true,
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
  const [selectedCategory, setSelectedCategory] = useState<CategoryEntity>();

  const handleChangeCategoriesType = (type) => setCategoriesType(type);

  const handlePressCategory = (category: CategoryEntity, isLongPress: boolean) => {
    setSelectedCategory(category);
    if (isEditMode || isLongPress) {
      setIsCategoryModalOpen(true);
    } else {
      !selectedAccount && setSelectedAccount(accounts[0]);
      setSelectedTransaction(new TransactionEntity({ date }));
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
    await queryClient.refetchQueries('accounts');
    setIsEditMode(false);
  };

  const handleDeleteCategory = async (entityLike: Partial<CategoryEntity>) => {
    await categoriesService.deleteOne(entityLike);
    await initialize();
    await queryClient.refetchQueries('accounts');
    setIsEditMode(false);
  };

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountEntity>();
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionEntity>();

  const handlePressTransaction = (transaction: TransactionEntity) => {
    setSelectedAccount(transaction.account);
    setSelectedCategory(transaction.category);
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handlePressCreateTransaction = () => {
    !selectedAccount && setSelectedAccount(accounts[0]);
    !selectedCategory && setSelectedCategory(slides[0]?.categories[0]);
    setSelectedTransaction(new TransactionEntity({ date }));
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (entityLike: Partial<TransactionEntity>) => {
    if (entityLike.id) {
      await transactionsService.updateOne({ id: entityLike.id }, entityLike);
    } else {
      await transactionsService.createOne(entityLike);
    }
    await initialize();
    await queryClient.refetchQueries('accounts');
  };

  const handleDeleteTransaction = async (entityLike: Partial<TransactionEntity>) => {
    await transactionsService.deleteOne(entityLike);
    await initialize();
    await queryClient.refetchQueries('accounts');
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FloatingButton onPress={handlePressCreateTransaction} />

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
          {accounts?.reduce((acc, current) => (acc += current.balance), 0)?.toFixed(2)}
        </Text>
        {isEditMode && (
          <TouchableOpacity onPress={handlePressCreateCategory}>
            <Text style={{ fontSize: 22 }}>Add</Text>
          </TouchableOpacity>
        )}
        {route === 'Categories' && (
          <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
            <Text style={{ fontSize: 22 }}>{isEditMode ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        )}
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
            {slides.map((slide, slideIndex) => (
              <View key={slideIndex}>
                {route === 'Categories' ? (
                  <CategoriesInnerScreen
                    slide={slide}
                    categoriesType={categoriesType}
                    onChangeCategoryType={handleChangeCategoriesType}
                    onPressCategory={handlePressCategory}
                  />
                ) : (
                  <TransactionsInnerScreen
                    slide={slide}
                    key={slideIndex}
                    onPressTransaction={handlePressTransaction}
                  />
                )}

                <CreateOrUpdateCategoryModal
                  isOpen={isCategoryModalOpen}
                  initialCategory={selectedCategory}
                  onClose={() => setIsCategoryModalOpen(false)}
                  onSave={handleSaveCategory}
                  onDelete={handleDeleteCategory}
                />

                <CreateOrUpdateTransactionModal
                  isOpen={isTransactionModalOpen}
                  accounts={accounts}
                  categories={slide.categories}
                  initialAccount={selectedAccount}
                  initialCategory={selectedCategory}
                  initialTransaction={selectedTransaction}
                  onClose={() => setIsTransactionModalOpen(false)}
                  onSave={handleSaveTransaction}
                  onDelete={handleDeleteTransaction}
                />
              </View>
            ))}
          </Slider>
        ) : null}
      </View>
    </View>
  );
};
