import {
  SelectQueryBuilder,
  FindOptionsUtils,
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
  EntityManager,
  DeepPartial,
} from 'typeorm';

import { FindManyBracketsOptions } from '../interfaces/common.interface';
import { TransactionEntity } from '../entities/transaction.entity';
import { CategoryTypeEnum } from '../enums/category-type.enum';
import { floatToInt } from '../common/helpers/numbers.helper';
import { TransactionStatsDto } from '../dto/transactions';
import { CommonService } from './common.service';
import { AccountEntity } from '../entities';

/**
 * [description]
 */
export class TransactionsService extends CommonService<TransactionEntity> {
  /**
   * @param repository
   */
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

  /**
   * [description]
   * @param entityLike
   * @param type
   * @param entityManager
   */
  public async processOne(
    entityLike: Partial<TransactionEntity>,
    type: CategoryTypeEnum,
    entityManager: EntityManager,
  ): Promise<Partial<TransactionEntity>> {
    const { amount, account } = entityLike;
    const intAmount = floatToInt(amount);
    const operation = type === CategoryTypeEnum.EXPENSE ? 'decrement' : 'increment';

    await entityManager[operation](AccountEntity, { id: account.id }, 'balance', intAmount);
    return entityLike;
  }

  /**
   * [description]
   * @param type
   */
  public getReversedType(type: CategoryTypeEnum) {
    return type === CategoryTypeEnum.EXPENSE ? CategoryTypeEnum.INCOME : CategoryTypeEnum.EXPENSE;
  }

  /**
   * [description]
   * @param entityLike
   * @param entityManager
   */
  public async createOne(
    entityLike: DeepPartial<TransactionEntity>,
    entityManager?: EntityManager,
  ): Promise<TransactionEntity> {
    return this.repository.manager.transaction(async (runEntityManager) => {
      const transactionalEntityManager = entityManager || runEntityManager;

      const mergeIntoEntity = this.repository.create(entityLike);
      const entity = await transactionalEntityManager.save(mergeIntoEntity).catch(() => {
        throw new Error('INPUT_DATA_ERROR');
      });
      await this.processOne(entity, entity.category.type, transactionalEntityManager);
      return entity;
    });
  }

  /**
   * [description]
   * @param conditions
   * @param entityLike
   * @param options
   */
  public async updateOne(
    conditions: FindOneOptions<TransactionEntity>['where'],
    entityLike: DeepPartial<TransactionEntity>,
    entityManager?: EntityManager,
  ): Promise<TransactionEntity> {
    return this.repository.manager.transaction(async (runEntityManager) => {
      const transactionalEntityManager = entityManager || runEntityManager;
      const mergeIntoEntity = await this.selectOne(conditions, { loadEagerRelations: true });

      await this.processOne(
        mergeIntoEntity,
        this.getReversedType(mergeIntoEntity.category.type),
        transactionalEntityManager,
      );

      const entity = this.repository.merge(mergeIntoEntity, entityLike);

      await this.processOne(entity, entity.category.type, transactionalEntityManager);

      return transactionalEntityManager.save(entity).catch(() => {
        throw new Error('INPUT_DATA_ERROR');
      });
    });
  }

  /**
   * [description]
   * @param conditions
   * @param options
   */
  public async deleteOne(
    conditions: FindOptionsWhere<TransactionEntity>,
    entityManager?: EntityManager,
  ): Promise<TransactionEntity> {
    return this.repository.manager.transaction(async (runEntityManager) => {
      const transactionalEntityManager = entityManager || runEntityManager;
      const entity = await this.selectOne(conditions, { loadEagerRelations: true });

      await this.processOne(
        entity,
        this.getReversedType(entity.category.type),
        transactionalEntityManager,
      );

      return transactionalEntityManager.remove(entity).catch(() => {
        throw new Error('NOT_FOUND_ERROR');
      });
    });
  }
}
