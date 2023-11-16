import { CategoryEntity } from '../entities/category.entity';
import { CommonService } from './common.service';

import { FindManyBracketsOptions } from '../interfaces/common.interface';
import { EntityManager } from 'typeorm';

/**
 * [description]
 */
export class CategoriesService extends CommonService<CategoryEntity> {
  constructor(repository) {
    super(CategoryEntity, repository);
  }

  /**
   * [description]
   * @param options
   * @param entityManager
   */
  public async selectManyWithTotal(
    options: FindManyBracketsOptions<CategoryEntity> = { loadEagerRelations: false },
    entityManager?: EntityManager,
  ): Promise<CategoryEntity[]> {
    const qb = this.find(options, entityManager);
    if (options.whereBrackets) qb.andWhere(options.whereBrackets);

    qb.leftJoin('CategoryEntity.transactions', 'TransactionEntity');
    qb.addSelect('SUM(TransactionEntity.amount)', 'transactionsTotal');
    qb.addSelect('COUNT(TransactionEntity.id)', 'transactionsCount');
    qb.addGroupBy('CategoryEntity.id');

    return qb.getMany().catch(() => {
      throw new Error('NOT_FOUND_ERROR');
    });
  }
}
