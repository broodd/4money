import { Column, Entity, OneToMany } from 'typeorm';

import { VirtualColumn } from '../data-sources/virtual-column.decorator';
import { CategoryTypeEnum } from '../enums/category-type.enum';
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
  @Column({ type: 'varchar', length: 16, nullable: true })
  public readonly color?: string;

  /**
   * [description]
   */
  @OneToMany(() => TransactionEntity, ({ category }) => category)
  public readonly transactions: Partial<TransactionEntity>[];

  /**
   * [description]
   */
  @VirtualColumn()
  public readonly transactionsTotal: number;

  /**
   * [description]
   */
  @VirtualColumn()
  public readonly transactionsCount: number;
}
