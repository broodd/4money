import { AccountEntity } from '../entities/account.entity';
import { CommonService } from './common.service';

/**
 * [description]
 */
export class AccountsService extends CommonService<AccountEntity> {
  constructor(repository) {
    super(AccountEntity, repository);
  }
}
