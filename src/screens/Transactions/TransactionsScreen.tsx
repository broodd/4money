import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from 'react-query';

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

interface Slide {
  transactionsGroup: TransactionsGroup[];
  date: Date;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

export const TransactionsScreen = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [type, setType] = useState<TypePeriodEnum>(TypePeriodEnum.month);
  const [date, setDate] = useState<Date>(today);

  const { data: accounts = [] } = useQuery('accounts', () => accountsService.selectMany());

  const handleClickCreate = async () => {
    await transactionsService.createOne({
      type: TransactionTypeEnum.EXPENSE,
      date: new Date('2023-12-01'),
      amount: 565,
    });
    // setSlides((prevState) => {
    //   return prevState.map((value) => {
    //     // value.date === new
    //   })
    // })
    // await initialize();
  };

  const initialize = async (): Promise<void> => {
    const dates = [
      getPrevOrNextDateByCurrent.prev[type](date),
      today,
      getPrevOrNextDateByCurrent.next[type](date),
    ];

    const promises = await Promise.all(
      dates.map((d) =>
        transactionsService.selectMany(
          new SelectTransactionsDto({
            date: getDatesByTypePeriod[type](d),
            order: { date: 'desc' },
          }),
        ),
      ),
    );

    setSlides(
      promises.map((transactions, index) => ({
        date: dates[index],
        transactionsGroup: groupTransactionsByDate(transactions),
      })),
    );
  };

  const handleSlidePrev = async (selectedDate) => {
    console.log('--- slide prev');
    const transactionsOptions = new SelectTransactionsDto({
      date: getDatesByTypePeriod[type](selectedDate),
    });
    const transactions = await transactionsService.selectMany(transactionsOptions);
    const transactionsGroup = groupTransactionsByDate(transactions);
    setSlides((prevState) => [{ date: selectedDate, transactionsGroup }, ...prevState]);
  };

  const handleSlideNext = async (selectedDate) => {
    console.log('--- slide prev');

    const transactionsOptions = new SelectTransactionsDto({
      date: getDatesByTypePeriod[type](selectedDate),
    });
    const transactions = await transactionsService.selectMany(transactionsOptions);
    const transactionsGroup = groupTransactionsByDate(transactions);
    setSlides((prevState) => [...prevState, { date: selectedDate, transactionsGroup }]);
  };

  useEffect(() => {
    initialize();
  }, []);

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
        slides={slides}
        type={type}
        date={date}
        onChangeDate={(value) => setDate(value)}
        onPrev={handleSlidePrev}
        onNext={handleSlideNext}
      >
        {slides.map((slide, slideIndex) => (
          <ScrollView key={slideIndex} style={{ height: '100%' }}>
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
                    <Text>{transaction.type}</Text>
                    <Text>{transaction.amount}</Text>
                    <Text>{transaction.description}</Text>
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
