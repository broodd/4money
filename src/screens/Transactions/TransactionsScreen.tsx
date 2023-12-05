import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery, useQueryClient } from 'react-query';

import { accountsService, transactionsService } from '../../data-sources/data-source';
import { TransactionTypeEnum } from '../../enums/transaction-type.enum';
import { FloatingButton } from '../../components/FloatingButton';
import { SelectTransactionsDto } from '../../dto/transactions';
import { Slider } from '../../components/Slider';
import { TypePeriodEnum } from '../../enums';
import {
  getPrevOrNextDateByCurrent,
  groupTransactionsByDate,
  getDatesByTypePeriod,
  TransactionsGroup,
} from '../../common/helpers';
import { useDate } from '../../common/store';

interface Slide {
  transactionsGroup: TransactionsGroup[];
  date: Date;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

export const TransactionsScreen = () => {
  const queryClient = useQueryClient();
  const [type, setType] = useState<TypePeriodEnum>(TypePeriodEnum.month);

  const { data: date } = useDate();
  const { data: transactionsSlides = [] } = useQuery('transactionsSlides', () => initialize());
  const { data: accounts = [] } = useQuery(
    'accounts',
    async () => await accountsService.selectMany(),
  );

  const handleClickCreate = async () => {
    await transactionsService.createOne({
      type: TransactionTypeEnum.EXPENSE,
      date,
      amount: 10000,
      // categoryId: 'e2788e18-2318-414c-9b5a-09ba9cb6075c',
      categoryId: '7a689ee1-6c54-409f-a510-dc4619bee035',
    });

    queryClient.refetchQueries('slides');
  };

  const initialize = async (): Promise<Slide[]> => {
    const dates = [
      getPrevOrNextDateByCurrent.prev[type](date),
      date,
      getPrevOrNextDateByCurrent.next[type](date),
    ];

    const promises = await Promise.all(
      dates.map((d) =>
        transactionsService.selectMany(
          new SelectTransactionsDto({
            date: getDatesByTypePeriod[type](d),
            order: { date: 'desc', createdAt: 'desc' },
          }),
        ),
      ),
    );

    return promises.map((transactions, index) => ({
      date: dates[index],
      transactionsGroup: groupTransactionsByDate(transactions),
    }));
  };

  const handleSlidePrev = async (selectedDate) => {
    const transactionsOptions = new SelectTransactionsDto({
      date: getDatesByTypePeriod[type](selectedDate),
    });
    const transactions = await transactionsService.selectMany(transactionsOptions);
    const transactionsGroup = groupTransactionsByDate(transactions);
    const data = [{ date: selectedDate, transactionsGroup }, ...transactionsSlides];
    queryClient.setQueryData<Slide[]>('transactionsSlides', data);
  };

  const handleSlideNext = async (selectedDate) => {
    const transactionsOptions = new SelectTransactionsDto({
      date: getDatesByTypePeriod[type](selectedDate),
    });
    const transactions = await transactionsService.selectMany(transactionsOptions);
    const transactionsGroup = groupTransactionsByDate(transactions);
    const data = [...transactionsSlides, { date: selectedDate, transactionsGroup }];
    queryClient.setQueryData<Slide[]>('transactionsSlides', data);
  };

  return (
    <View style={{ flex: 1 }}>
      <FloatingButton onPress={handleClickCreate} />

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
        <TouchableOpacity>
          <Text>Search</Text>
        </TouchableOpacity>
      </View>

      <Slider
        slides={transactionsSlides}
        typePeriod={type}
        date={date}
        onChangeDate={(value) => {
          console.log('--- date', date);
          queryClient.setQueryData('date', value);
        }}
        onPrev={handleSlidePrev}
        onNext={handleSlideNext}
      >
        {transactionsSlides.map((slide, slideIndex) => (
          <ScrollView key={slideIndex} style={{ height: '100%' }}>
            <Text>{slideIndex}</Text>
            <Text>{slide.date.toDateString()}</Text>
            {slide.transactionsGroup.map((group, index) => (
              <View key={index}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text>{group.date}</Text>
                  <Text>{group.total}</Text>
                </View>

                {group.transactions.map((transaction, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                  >
                    <Text>{transaction.amount}</Text>
                    <Text>{transaction.description}</Text>
                    <Text>{transaction.categoryId ? 'cat' : ''}</Text>
                    <Text>{transaction.date.toISOString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        ))}
      </Slider>
    </View>
  );
};
