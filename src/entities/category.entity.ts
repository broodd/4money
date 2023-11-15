import { Column, Entity, OneToMany } from 'typeorm';

import { CategoryTypeEnum } from '../enums/category-type.enum';
import { CurrencyCodeEnum } from '../enums/currency.enum';
import { TransactionEntity } from './transaction.entity';
import { CommonEntity } from './common.entity';

/**
 * [description]
 */
@Entity('categories')
export class CategoryEntity extends CommonEntity {
  /**
   * [description]
   * @param data
   */
  constructor(data?: Partial<CategoryEntity>) {
    super();
    if (data) Object.assign(this, data);
  }

  /**
   * [description]
   */
  @Column({ type: 'varchar', length: 64, nullable: false })
  public readonly name: string;

  /**
   * [description]
   */
  @Column({ type: 'varchar', nullable: false })
  public readonly type: CategoryTypeEnum;

  /**
   * [description]
   */
  @Column({ type: 'varchar', default: CurrencyCodeEnum.UAH, nullable: false })
  public readonly currencyCode: CurrencyCodeEnum;

  // /**
  //  * [description]
  //  */
  // @Column({ type: 'varchar', length: 32, nullable: true })
  // public readonly color: string;

  /**
   * [description]
   */
  @OneToMany(() => TransactionEntity, ({ category }) => category)
  public readonly transactions: Partial<TransactionEntity>[];

  // /**
  //  * [description]
  //  */
  // public readonly transactionsTotal: number;

  // /**
  //  * [description]
  //  */
  // public readonly transactionsCount: number;
}
