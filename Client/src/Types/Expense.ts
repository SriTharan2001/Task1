export interface Expense {
  objectId: string;
  amount: number | string;
  category: string;
  date: string; // ISO date string
_id : string;
  description?: string;
}