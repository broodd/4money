import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from './common.entity';

import { FloatIntColumnTransformer } from '../data-sources/float-int-column.transformer';
import { CategoryEntity } from './category.entity';
import { AccountEntity } from './account.entity';

/**
 * [description]
 */
@Entity('transactions')
export class TransactionEntity extends CommonEntity {
  /**
   * [description]
   * @param data
   */
  constructor(data?: Partial<TransactionEntity>) {
    super();
    if (data) Object.assign(this, data);
  }

  /**
   * [description]
   */
  @Column({
    type: 'integer',
    nullable: false,
    transformer: FloatIntColumnTransformer,
  })
  public readonly amount: number;

  /**
   * [description]
   */
  @Column({ type: 'varchar', length: 256, nullable: true })
  public readonly description?: string;

  /**
   * [description]
   */
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  public readonly date: Date;

  /**
   * [description]
   */
  @ManyToOne(() => CategoryEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  public category: CategoryEntity;

  /**
   * [description]
   */
  @Column({ type: 'uuid', nullable: true })
  public categoryId: string;

  /**
   * [description]
   */
  @ManyToOne(() => AccountEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  public account: AccountEntity;

  /**
   * [description]
   */
  @Column({ type: 'uuid', nullable: true })
  public accountId: string;
}
