import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import Swiper from 'react-native-swiper';

import { accountsService, transactionsService } from '../../data-sources/data-source';
import { TransactionTypeEnum } from '../../enums/transaction-type.enum';
import { SelectTransactionsDto } from '../../dto/transactions';
import { TransactionEntity } from '../../entities';
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
  const { data: accounts = [] } = useQuery('accounts', () => accountsService.selectMany());
  // const { data: transactionsGroup = [], refetch } = useQuery('transactionsGroup', async () => {
  //   const result = await transactionsService.selectMany({ order: { createdAt: 'desc' } });
  //   return groupTransactionsByDate(result);
  // });

  const createOrEditMutation = useMutation(
    async (entityLike: Partial<TransactionEntity>) =>
      await transactionsService.createOne(entityLike),
    // { onSuccess: () => refetch() },
  );
  const handleClickCreate = () => {
    createOrEditMutation.mutateAsync({
      type: TransactionTypeEnum.EXPENSE,
      date: new Date(),
      amount: 10,
    });
  };

  const swiperInstance = useRef<Swiper | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [type, setType] = useState<TypePeriodEnum>(TypePeriodEnum.month);
  const [date, setDate] = useState<Date>(today);

  const initialize = async (): Promise<void> => {
    const dates = [
      getPrevOrNextDateByCurrent.prev[type](date),
      today,
      getPrevOrNextDateByCurrent.next[type](date),
    ];

    const promises = await Promise.all(
      dates.map((d) =>
        transactionsService.selectMany(
          new SelectTransactionsDto({ createdAt: getDatesByTypePeriod[type](d) }),
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

  const handleSlideChanged = (index: number) => {
    if (index === 0) {
      // setSlides((prevState) => [0, ...prevState]);
    } else if (index === slides.length - 1) {
      // setSlides((prevState) => [...prevState, slides.length]);
    }
  };

  useEffect(() => {
    if ((swiperInstance.current?.state as any).index === 0)
      swiperInstance.current.scrollBy(1, false);
  }, [slides]);

  return (
    <View style={{ flex: 1 }}>
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
        <TouchableOpacity onPress={handleClickCreate}>
          <Text>Search</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          height: 30,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            const index = (swiperInstance.current?.state as any).index;
            if (index === 0) {
              // setSlides((prevState) => [0, ...prevState]);
            } else {
              swiperInstance.current.scrollTo(index - 1, true);
            }
          }}
        >
          <Text>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const index = (swiperInstance.current?.state as any).index;
            swiperInstance.current.scrollTo(index + 1, true);
          }}
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <Swiper
          style={{ height: '100%' }}
          ref={swiperInstance}
          loop={false}
          showsPagination={false}
          onIndexChanged={handleSlideChanged}
        >
          {slides.map((slide, slideIndex) => (
            <ScrollView key={slideIndex}>
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
        </Swiper>
      </View>
    </View>
  );
};
