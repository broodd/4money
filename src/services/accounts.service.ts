import { AccountEntity } from '../entities/account.entity';
import { CommonService } from './common.service';

import { dataSource } from '../data-sources/data-source';

/**
 * [description]
 */
export class AccountsService extends CommonService<AccountEntity> {
  constructor() {
    super(AccountEntity, dataSource.getRepository(AccountEntity));
  }
}

export const accountsService = new AccountsService();
