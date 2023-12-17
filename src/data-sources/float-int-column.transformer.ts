import { ValueTransformer } from 'typeorm';
import { floatToInt } from '../common/helpers';

export const FloatIntColumnTransformer: ValueTransformer = {
  to: (value: number): number => value && floatToInt(value),
  from: (value: number) => parseFloat((value / 100).toFixed(2)),
};
