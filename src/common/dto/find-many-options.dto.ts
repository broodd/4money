import { FindManyOptions, FindOneOptions } from 'typeorm';

import { FindOneOptionsDto } from './find-one-options.dto';
import { FindManyBracketsOptions } from '../../interfaces/common.interface';

/**
 * [description]
 */
export class FindManyOptionsDto<Entity>
  extends FindOneOptionsDto<Entity>
  implements FindManyBracketsOptions
{
  /**
   * Order, in which entities should be ordered
   */
  public readonly asc?: string[];

  /**
   * If the same fields are specified for sorting in two directions, the priority is given to DESC
   */
  public readonly desc?: string[];

  /**
   * Getter to form an object of order. Available after calling instanceToPlain
   */
  public readonly order: FindManyOptions['order'];

  /**
   * Offset (paginated) where from entities should be taken
   */
  public readonly page?: number = 1;

  /**
   * Limit (paginated) - max number of entities should be taken
   */
  public take?: number;

  /**
   * Getter to form an object of skip. Available after calling instanceToPlain
   */
  public get skip(): number {
    return (this.take || 0) * (this.page - 1);
  }

  /**
   * Dto conditions
   */
  public get whereBrackets(): FindOneOptions['where'] {
    return {};
  }
}
