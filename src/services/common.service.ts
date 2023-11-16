import {
  SelectQueryBuilder,
  FindOptionsWhere,
  FindOptionsUtils,
  FindManyOptions,
  FindOneOptions,
  EntityManager,
  DeepPartial,
  Repository,
} from 'typeorm';

import { FindManyBracketsOptions, PaginationDto, Type } from '../interfaces/common.interface';
import { CommonEntity } from '../entities/common.entity';

/**
 * [description]
 */
export class CommonService<EntityClass extends CommonEntity> {
  /**
   * [description]
   * @param entityClass
   * @param repository
   */
  constructor(
    public readonly entityClass: Type<EntityClass>,
    public readonly repository: Repository<EntityClass>,
  ) {}

  /**
   * [description]
   * @param entityLike
   * @param entityManager
   */
  public async createOne(
    entityLike: DeepPartial<EntityClass>,
    entityManager?: EntityManager,
  ): Promise<EntityClass> {
    return this.repository.manager.transaction(async (runEntityManager) => {
      const transactionalEntityManager = entityManager || runEntityManager;

      const entity = this.repository.create(entityLike);
      return transactionalEntityManager.save(entity).catch((error) => {
        console.log(error);
        throw new Error('INPUT_DATA_ERROR');
      });
    });
  }

  /**
   * [description]
   * @param entityLike
   * @param entityManager
   */
  public async createOneAndSelect(
    entityLike: DeepPartial<EntityClass>,
    entityManager?: EntityManager,
  ): Promise<EntityClass> {
    const { id } = await this.createOne(entityLike, entityManager);
    return this.selectOne(
      { id } as FindOptionsWhere<EntityClass>,
      { loadEagerRelations: true },
      entityManager,
    );
  }

  /**
   * [description]
   * @param optionsOrConditions
   * @param entityManager
   */
  public find(
    optionsOrConditions: FindManyOptions<EntityClass> = {},
    entityManager?: EntityManager,
  ): SelectQueryBuilder<EntityClass> {
    const metadata = this.repository.metadata;
    const alias =
      FindOptionsUtils.extractFindManyOptionsAlias(optionsOrConditions) || metadata.name;

    const qb = entityManager
      ? entityManager.createQueryBuilder(this.entityClass, alias)
      : this.repository.createQueryBuilder(alias);

    qb.setFindOptions(optionsOrConditions);

    /**
     * To add order by like `__custom` fields
     */
    // setQueryOrder(qb, optionsOrConditions['asc'], 'ASC');
    // setQueryOrder(qb, optionsOrConditions['desc'], 'DESC');

    if (
      !FindOptionsUtils.isFindManyOptions(optionsOrConditions) ||
      optionsOrConditions.loadEagerRelations !== false
    ) {
      FindOptionsUtils.joinEagerRelations(qb, alias, metadata);

      /**
       * Place for common relation
       * @example qb.leftJoinAndSelect('Entity.relation_field', 'Entity_relation_field')
       */
    }

    return qb;
  }

  /**
   * [description]
   * @param options
   * @param entityManager
   */
  public async selectManyAndCount(
    options: FindManyBracketsOptions<EntityClass> = { loadEagerRelations: false },
    entityManager?: EntityManager,
  ): Promise<PaginationDto<EntityClass>> {
    const qb = this.find(options, entityManager);
    if (options.whereBrackets) qb.andWhere(options.whereBrackets);
    return Promise.all([qb.getMany(), qb.getCount()])
      .then((data) => new PaginationDto(data))
      .catch(() => {
        throw new Error('NOT_FOUND_ERROR');
      });
  }

  /**
   * [description]
   * @param options
   * @param entityManager
   */
  public async selectMany(
    options: FindManyBracketsOptions<EntityClass> = { loadEagerRelations: false },
    entityManager?: EntityManager,
  ): Promise<EntityClass[]> {
    const qb = this.find(options, entityManager);
    if (options.whereBrackets) qb.andWhere(options.whereBrackets);
    return qb.getMany().catch(() => {
      throw new Error('NOT_FOUND_ERROR');
    });
  }

  /**
   * [description]
   * @param conditions
   * @param options
   * @param entityManager
   */
  public async selectOne(
    conditions: FindOneOptions<EntityClass>['where'],
    options: FindOneOptions<EntityClass> = { loadEagerRelations: false },
    entityManager?: EntityManager,
  ): Promise<EntityClass> {
    return this.find({ ...options, where: conditions }, entityManager)
      .getOneOrFail()
      .catch(() => {
        throw new Error('NOT_FOUND_ERROR');
      });
  }

  /**
   * [description]
   * @param conditions
   * @param entityLike
   * @param entityManager
   */
  public async updateOne(
    conditions: FindOneOptions<EntityClass>['where'],
    entityLike: DeepPartial<EntityClass>,
    entityManager?: EntityManager,
  ): Promise<EntityClass> {
    return this.repository.manager.transaction(async (runEntityManager) => {
      const transactionalEntityManager = entityManager || runEntityManager;

      const mergeIntoEntity = await this.selectOne(
        conditions,
        { loadEagerRelations: false },
        transactionalEntityManager,
      );
      const entity = this.repository.merge(mergeIntoEntity, entityLike);
      return transactionalEntityManager.save(entity).catch(() => {
        throw new Error('INPUT_DATA_ERROR');
      });
    });
  }

  /**
   * [description]
   * @param conditions
   * @param entityLike
   * @param entityManager
   */
  public async updateOneAndSelect(
    conditions: FindOneOptions<EntityClass>['where'],
    entityLike: DeepPartial<EntityClass>,
    entityManager?: EntityManager,
  ): Promise<EntityClass> {
    const { id } = await this.updateOne(conditions, entityLike, entityManager);
    return this.selectOne(
      { id } as FindOptionsWhere<EntityClass>,
      { loadEagerRelations: true },
      entityManager,
    );
  }

  /**
   * [description]
   * @param conditions
   * @param entityManager
   */
  public async deleteOne(
    conditions: FindOneOptions<EntityClass>['where'],
    entityManager?: EntityManager,
  ): Promise<EntityClass> {
    return this.repository.manager.transaction(async (runEntityManager) => {
      const transactionalEntityManager = entityManager || runEntityManager;

      const entity = await this.selectOne(
        conditions,
        { loadEagerRelations: false },
        transactionalEntityManager,
      );
      return transactionalEntityManager.remove(entity).catch(() => {
        throw new Error('NOT_FOUND_ERROR');
      });
    });
  }
}
