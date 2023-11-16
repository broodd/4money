import { TypePeriodEnum } from '../../enums';

export const transformDateByTypePeriod = {
  /**
   * ALL TIME
   */
  [TypePeriodEnum.all]: () => 'ALL TIME',

  /**
   * FRI, 7 JULY 2023
   * @param date
   */
  [TypePeriodEnum.day]: (date: Date) =>
    `${date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()}, ${date.getDate()} ${date
      .toLocaleString('en-US', { month: 'long' })
      .toUpperCase()} ${date.getFullYear()}`,

  /**
   * TODO
   * @param date
   */
  [TypePeriodEnum.week]: (date: Date) => `YEAR ${date.getFullYear()}`,

  /**
   * TODO
   * @param date
   */
  [TypePeriodEnum.range]: (date: Date) => `YEAR ${date.getFullYear()}`,

  /**
   * JULY 2023
   * @param date
   */
  [TypePeriodEnum.month]: (date: Date) =>
    `${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()} ${date.getFullYear()}`,

  /**
   * YEAR 2023
   * @param date
   */
  [TypePeriodEnum.year]: (date: Date) => `YEAR ${date.getFullYear()}`,
};

export const getDatesByTypePeriod = {
  /**
   * ALL TIME
   */
  [TypePeriodEnum.all]: () => {
    return [];
  },

  /**
   * FRI, 7 JULY 2023
   * @param date
   */
  [TypePeriodEnum.day]: (date: Date) => {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return [start, end];
  },

  /**
   * TODO
   * @param date
   */
  [TypePeriodEnum.week]: (date: Date) => [],

  /**
   * TODO
   * @param date
   */
  [TypePeriodEnum.range]: (date: Date) => [],

  /**
   * JULY 2023
   * @param date
   */
  [TypePeriodEnum.month]: (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  },

  /**
   * YEAR 2023
   * @param date
   */
  [TypePeriodEnum.year]: (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 0);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  },
};

export const getPrevOrNextDateByCurrent = {
  prev: {
    [TypePeriodEnum.all]: (date: Date) => {
      return date;
    },
    [TypePeriodEnum.week]: (date: Date) => {
      return date;
    },
    [TypePeriodEnum.range]: (date: Date) => {
      return date;
    },
    [TypePeriodEnum.day]: (date: Date) => {
      const prev = new Date(date);
      prev.setDate(date.getDate() - 1);
      return prev;
    },

    [TypePeriodEnum.month]: (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
    },

    [TypePeriodEnum.year]: (date: Date) => {
      return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
    },
  },

  next: {
    [TypePeriodEnum.all]: (date: Date) => {
      return date;
    },
    [TypePeriodEnum.week]: (date: Date) => {
      return date;
    },
    [TypePeriodEnum.range]: (date: Date) => {
      return date;
    },
    [TypePeriodEnum.day]: (date: Date) => {
      const prev = new Date(date);
      prev.setDate(date.getDate() + 1);
      return prev;
    },

    [TypePeriodEnum.month]: (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
    },

    [TypePeriodEnum.year]: (date: Date) => {
      return new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
    },
  },
};
