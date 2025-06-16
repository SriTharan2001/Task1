export interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  title?: string; // Added optional title field
}
