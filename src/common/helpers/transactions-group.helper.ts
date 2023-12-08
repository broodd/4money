import { TransactionEntity } from '../../entities';

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

    groups[dateString].total += el.amount;
    groups[dateString].transactions.push(el);

    return groups;
  }, {} as Record<string, TransactionsGroupItem>);

  return Object.keys(groups).map((date) => ({
    date,
    total: groups[date].total,
    transactions: groups[date].transactions,
  }));
};
