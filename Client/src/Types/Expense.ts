export type Expense = {
  _id: string;
  userId: string;
  title: string;
  date: string | Date;
  amount: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
};