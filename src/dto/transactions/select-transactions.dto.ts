import { Brackets } from 'typeorm';

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

  /**
   * [description]
   */
  public get whereBracketsString(): { conditions: string; paramets: Record<string, any> } {
    const { date } = this;

    const conditions = [];
    const paramets: Record<string, any> = {};

    if (date?.length) {
      conditions.push('(TransactionEntity.date BETWEEN :dateFrom AND :dateTo)');
      paramets.dateFrom = date[0];
      paramets.dateTo = date[1];
    }

    return {
      conditions: conditions.join(' AND '),
      paramets,
    };
  }
}
