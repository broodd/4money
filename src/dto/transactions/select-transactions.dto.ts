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
  constructor(data?: Partial<SelectTransactionsDto>) {
    Object.assign(this, data);
  }
  /**
   * [description]
   */
  public createdAt?: Date[];

  /**
   * [description]
   */
  public get whereBrackets(): Brackets {
    const { createdAt } = this;

    return new Brackets((qb) => {
      if (createdAt?.length)
        qb.andWhere('TransactionEntity.createdAt BETWEEN :createdAtFrom AND :createdAtTo', {
          createdAtFrom: createdAt[0],
          createdAtTo: createdAt[1],
        });
    });
  }
}
