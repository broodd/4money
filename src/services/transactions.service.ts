import { TransactionEntity } from '../entities/transaction.entity';
import { CommonService } from './common.service';

import { FindManyBracketsOptions } from '../interfaces/common.interface';
import { EntityManager, FindManyOptions, FindOptionsUtils, SelectQueryBuilder } from 'typeorm';
import { TransactionStatsDto } from '../dto/transactions';

/**
 * [description]
 */
export class TransactionsService extends CommonService<TransactionEntity> {
  constructor(repository) {
    super(TransactionEntity, repository);
  }

  /**
   * [description]
   * @param optionsOrConditions
   * @param entityManager
   */
  public find(
    optionsOrConditions: FindManyOptions<TransactionEntity> = {},
    entityManager?: EntityManager,
  ): SelectQueryBuilder<TransactionEntity> {
    const qb = super.find(optionsOrConditions, entityManager);

    if (
      !FindOptionsUtils.isFindManyOptions(optionsOrConditions) ||
      optionsOrConditions.loadEagerRelations !== false
    ) {
      qb.leftJoinAndSelect('TransactionEntity.account', 'AccountEntity');
      qb.leftJoinAndSelect('TransactionEntity.category', 'CategoryEntity');
    }

    return qb;
  }

  /**
   * [description]
   * @param options
   * @param entityManager
   */
  public async selectManyWithTotalAndCount(
    options: FindManyBracketsOptions<TransactionEntity> = { loadEagerRelations: false },
    entityManager?: EntityManager,
  ): Promise<Record<string, TransactionStatsDto>> {
    const qb = this.find(options, entityManager);
    if (options.whereBrackets) qb.andWhere(options.whereBrackets);

    qb.select('TransactionEntity.categoryId', 'categoryId');
    qb.addSelect('COALESCE(SUM(TransactionEntity.amount), 0)', 'transactionsTotal');
    qb.addSelect('COALESCE(COUNT(TransactionEntity.id), 0)', 'transactionsCount');
    qb.addGroupBy('TransactionEntity.categoryId');

    const transactionsStats = await qb.getRawMany<TransactionStatsDto>().catch(() => {
      throw new Error('NOT_FOUND_ERROR');
    });

    return transactionsStats.reduce((acc, current) => {
      acc[current.categoryId] = current;
      return acc;
    }, {} as Record<string, TransactionStatsDto>);
  }
}
