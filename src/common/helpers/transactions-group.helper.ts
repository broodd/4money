import { TransactionEntity } from '../../entities';
import { CategoryTypeEnum } from '../../enums/category-type.enum';

/**
 * [description]
 */
export interface TransactionsGroupItem {
  total: number;
  transactions: TransactionEntity[];
}

/**
 * [description]
 */
export interface TransactionsGroup extends TransactionsGroupItem {
  date: string;
}

/**
 * [description]
 * @param transactions
 */
export const groupTransactionsByDate = (transactions: TransactionEntity[]): TransactionsGroup[] => {
  const groups = transactions.reduce((groups, el) => {
    const date = new Date(el.date);
    date.setHours(0, 0, 0, 0);
    const dateString = date.toDateString();

    if (!groups[dateString]) {
      groups[dateString] = {
        transactions: [],
        total: 0,
      };
    }

    groups[dateString].total +=
      el.amount * (el.category.type === CategoryTypeEnum.EXPENSE ? -1 : 1);
    groups[dateString].transactions.push(el);

    return groups;
  }, {} as Record<string, TransactionsGroupItem>);

  return Object.keys(groups).map((date) => ({
    date,
    total: parseFloat(groups[date].total.toFixed(2)),
    transactions: groups[date].transactions,
  }));
};
