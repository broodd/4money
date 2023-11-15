import { VIRTUAL_COLUMN_KEY } from './virtual-column.decorator';
import { SelectQueryBuilder } from 'typeorm';

/**
 * [description]
 */
declare module 'typeorm' {
  /**
   * [description]
   */
  interface SelectQueryBuilder<Entity> {
    /**
     * [description]
     */
    getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[]>;

    /**
     * [description]
     */
    getOne(this: SelectQueryBuilder<Entity>): Promise<Entity>;
  }
}

SelectQueryBuilder.prototype.getMany = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  const items = entities.map((entity, index) => {
    try {
      const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};

      const item = raw[index];

      for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
        entity[propertyKey] = item[name];
      }
    } catch {}

    return entity;
  });

  return items.slice();
};

SelectQueryBuilder.prototype.getOne = async function () {
  const { entities, raw } = await this.getRawAndEntities();

  try {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entities[0]) ?? {};

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entities[0][propertyKey] = raw[0][name];
    }
  } catch {}

  return entities[0];
};
