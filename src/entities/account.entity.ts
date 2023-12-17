import { Column, Entity } from 'typeorm';

import { CommonEntity } from './common.entity';
import { FloatIntColumnTransformer } from '../data-sources/float-int-column.transformer';

/**
 * [description]
 */
@Entity('accounts')
export class AccountEntity extends CommonEntity {
  /**
   * [description]
   * @param data
   */
  constructor(data?: Partial<AccountEntity>) {
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
  @Column({ type: 'varchar', length: 256, nullable: true })
  public readonly description?: string;

  /**
   * [description]
   */
  @Column({ type: 'varchar', length: 16, nullable: true })
  public readonly color?: string;

  /**
   * [description]
   */
  // @Column({ type: 'varchar', default: CurrencyCodeEnum.UAH, nullable: false })
  // public readonly currencyCode: CurrencyCodeEnum;

  /**
   * [description]
   */
  // @Column({ type: 'varchar', default: AccountTypeEnum.REGULAR, nullable: false })
  // public readonly type: AccountTypeEnum;

  /**
   * [description]
   */
  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    transformer: FloatIntColumnTransformer,
  })
  public readonly balance: number;

  // /**
  //  * [description]
  //  */
  // @ApiHideProperty()
  // @ManyToOne(() => UserEntity, {
  //   onDelete: 'CASCADE',
  //   nullable: false,
  // })
  // @JoinColumn()
  // public owner: Partial<UserEntity>;
}
