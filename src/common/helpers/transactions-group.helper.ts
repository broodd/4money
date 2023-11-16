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
    const date = el.date.toISOString().slice(0, 10);
    if (!groups[date]) {
      groups[date] = {
        transactions: [],
        total: 0,
      };
    }

    groups[date].total += el.amount;
    groups[date].transactions.push(el);

    return groups;
  }, {} as Record<string, TransactionsGroupItem>);

  return Object.keys(groups).map((date) => ({
    date,
    total: groups[date].total,
    transactions: groups[date].transactions,
  }));
};
