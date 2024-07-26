import { CategoryEntity } from '../entities/category.entity';
import { CommonService } from './common.service';

import { EntityManager } from 'typeorm';
import { SelectCategoriesDto } from '../dto/select-categoris.dto';

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
    options: SelectCategoriesDto,
    entityManager?: EntityManager,
  ): Promise<CategoryEntity[]> {
    const qb = this.find(options, entityManager);
    if (options.whereBrackets) qb.andWhere(options.whereBrackets);

    const transactionsOptions = options.transactionsOptions.whereBracketsString;
    qb.leftJoin(
      'CategoryEntity.transactions',
      'TransactionEntity',
      transactionsOptions.conditions,
      transactionsOptions.paramets,
    );
    qb.addSelect('COALESCE(SUM(TransactionEntity.amount / 100), 0)', 'transactionsTotal');
    qb.addSelect('COUNT(TransactionEntity.id)', 'transactionsCount');
    qb.addGroupBy('CategoryEntity.id');

    return qb.getMany().catch(() => {
      throw new Error('NOT_FOUND_ERROR');
    });
  }
}
