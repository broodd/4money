import { Brackets, FindOneOptions, ILike } from 'typeorm';

import { CategoryEntity } from '../entities';
import { FindManyBracketsOptions } from '../interfaces/common.interface';
import { SelectTransactionsDto } from './transactions/select-transactions.dto';
import { FindManyOptionsDto } from '../common/dto/find-many-options.dto';

/**
 * [description]
 */
export class SelectCategoriesDto extends FindManyOptionsDto<CategoryEntity> {
  /**
   * [description]
   * @param data
   */
  constructor(data?: Partial<FindManyBracketsOptions<CategoryEntity> & SelectCategoriesDto>) {
    super();
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
    const { search } = this;

    return new Brackets((qb) => {
      if (search) {
        const like = ILike(`%${search.trim()}%`);
        qb.andWhere({ name: like });
      }
    });
  }
}
