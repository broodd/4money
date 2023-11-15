import { TransactionEntity } from '../entities/transaction.entity';
import { CommonService } from './common.service';

import { dataSource } from '../data-sources/data-source';
import { FindManyBracketsOptions } from '../interfaces/common.interface';
import { EntityManager } from 'typeorm';
import { TransactionStatsDto } from '../dto/transactions';

/**
 * [description]
 */
export class TransactionsService extends CommonService<TransactionEntity> {
  constructor() {
    super(TransactionEntity, dataSource.getRepository(TransactionEntity));
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

export const transactionsService = new TransactionsService();
(window as any).transactionsService = transactionsService;
