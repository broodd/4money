import { Between, Brackets, FindOneOptions, ILike, ObjectLiteral } from 'typeorm';

import { TransactionEntity } from '../../entities';
import { FindManyBracketsOptions } from '../../interfaces/common.interface';

/**
 * [description]
 */
export class SelectTransactionsDto implements FindManyBracketsOptions<TransactionEntity> {
  /**
   * [description]
   * @param data
   */
  constructor(data?: Partial<FindManyBracketsOptions<TransactionEntity> & SelectTransactionsDto>) {
    Object.assign(this, data);
  }
  /**
   * [description]
   */
  public date?: Date[];

  /**
   * [description]
   */
  public get whereBrackets(): Brackets {
    const { date } = this;

    return new Brackets((qb) => {
      if (date?.length)
        qb.andWhere('TransactionEntity.date BETWEEN :dateFrom AND :dateTo', {
          dateFrom: date[0],
          dateTo: date[1],
        });
    });
  }
}
