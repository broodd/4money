import { FindManyOptions, FindOneOptions } from 'typeorm';

/**
 * [description]
 */
export interface FindManyBracketsOptions<Entity = any> extends FindManyOptions<Entity> {
  /**
   * [description]
   */
  whereObject?: FindOneOptions['where'];

  /**
   * [description]
   */
  whereBrackets?: FindOneOptions['where'];

  /**
   * [description]
   */
  whereBracketsString?: FindOneOptions['where'];
}

/**
 * [description]
 */
export class PaginationDto<Entity> {
  /**
   * [description]
   */
  constructor([result, count]: [Entity[], number]) {
    this.result = result;
    this.count = count;
  }

  /**
   * Result of the selection by the specified parameters.
   */
  public readonly result: Entity[];

  /**
   * Total number of records.
   */
  public readonly count: number;
}

/**
 * [description]
 */
export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
