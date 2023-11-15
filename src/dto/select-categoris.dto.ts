import { Brackets, FindManyOptions, FindOneOptions, ILike } from 'typeorm';

import { CategoryEntity } from '../entities';
import { FindManyBracketsOptions } from '../interfaces/common.interface';
import { SelectTransactionsDto } from './transactions/select-transactions.dto';

/**
 * [description]
 */
export class SelectCategoriesDto implements FindManyBracketsOptions<CategoryEntity> {
  /**
   * [description]
   * @param data
   */
  constructor(data?: Partial<SelectCategoriesDto>) {
    Object.assign(this, data);
  }

  /**
   * [description]
   */
  public search?: string;

  /**
   * [description]
   */
  public transactionsOptions?: SelectTransactionsDto;

  /**
   * [description]
   */
  public get whereBrackets(): FindOneOptions['where'] {
    const { search, transactionsOptions } = this;

    return new Brackets((qb) => {
      if (search) {
        const like = ILike(`%${search.trim()}%`);
        qb.andWhere({ name: like });
      }

      if (transactionsOptions) {
        qb.andWhere(transactionsOptions.whereBrackets);
      }
    });
  }
}
