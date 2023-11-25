import { FindOneOptions, FindOptionsSelect } from 'typeorm';

/**
 * [description]
 */
export class FindOneOptionsDto<Entity> implements FindOneOptions {
  /**
   * [description]
   */
  public readonly select?: FindOptionsSelect<Entity> | FindOptionsSelect<Entity>;

  /**
   * [description]
   */
  public readonly loadEagerRelations?: boolean;
}
