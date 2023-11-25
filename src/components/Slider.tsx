import React, { useEffect, useRef } from 'react';
import Swiper from 'react-native-swiper';
import { View } from 'react-native';

import { getPrevOrNextDateByCurrent } from '../common/helpers';
import { PeriodToolbar } from './PeriodToolbar';
import { TypePeriodEnum } from '../enums';

export const Slider = <T,>({
  slides,
  type,
  date,
  onChangeDate,
  onPrev,
  onNext,
  children,
}: {
  slides: T[];
  type: TypePeriodEnum;
  date: Date;
  onChangeDate: (date) => void;
  onPrev: (date) => void;
  onNext: (date) => void;
  children: React.ReactNode;
}) => {
  const swiperInstance = useRef<Swiper | null>(null);

  const getSlideIndex = () => {
    return (swiperInstance.current?.state as any)?.index;
  };

  const handleSlideChanged = async (index: number) => {
    const oldIndex = getSlideIndex();
    const direction = oldIndex < index ? 'next' : 'prev';

    if (index < 0 || oldIndex < 0)
      return swiperInstance.current?.setState((prevState) => ({ ...prevState, index: 1 }));

    /**
     * Check when redirect from start by scrollTo in useEffect
     */
    if (oldIndex === 0 && index === 1) return;

    /**
     * Check when scroll from
     */
    if (oldIndex - index > 1) {
      return setTimeout(() => swiperInstance.current?.scrollTo(1, false), 0);
    }

    const selectedDate = getPrevOrNextDateByCurrent[direction][type](date);
    onChangeDate(selectedDate);

    if (index > 0 && index < slides.length - 1) return;
    const newDate = getPrevOrNextDateByCurrent[direction][type](selectedDate);

    if (index === 0) await onPrev(newDate);
    else await onNext(newDate);
  };

  const handleSlidePrev = async () => {
    const index = getSlideIndex();
    if (index !== 0) {
      return swiperInstance.current.scrollTo(index - 1, true);
    }

    const selectedDate = getPrevOrNextDateByCurrent.prev[type](date);
    onChangeDate(selectedDate);

    await onPrev(selectedDate);
  };

  useEffect(() => {
    const index = getSlideIndex();
    if (index === 0) setTimeout(() => swiperInstance.current?.scrollTo(1, false), 0);
  }, [slides]);

  return (
    <View style={{ height: '100%' }}>
      <PeriodToolbar
        date={date}
        type={type}
        onPrev={handleSlidePrev}
        onNext={() => swiperInstance.current?.scrollTo(getSlideIndex() + 1, true)}
      />

      <Swiper
        style={{ height: '100%' }}
        ref={swiperInstance}
        loop={false}
        showsPagination={false}
        onIndexChanged={handleSlideChanged}
      >
        {children}
      </Swiper>
    </View>
  );
};
