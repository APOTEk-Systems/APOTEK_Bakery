import { api } from "@/lib/api";

export interface Expense {
  id: string;
  date: string;
  category: string;
  notes: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyBreakdown {

    category:string;
    total:number;
    date:string

}
export interface ExpensesList {
  totalExpenses : number;
  dailyBreakdown : DailyBreakdown []
}[]



export const expensesService = {
  getExpenses: async (params?: { category?: string; status?: string; search?: string; date?: string }): Promise<{ totalExpenses: number; dailyBreakdown: DailyBreakdown[] }> => {
    const response = await api.get<{ totalExpenses: number; dailyBreakdown: DailyBreakdown[] }>('/accounting/expenses', { params });
    console.log(response.data)
    return response.data;
  },

  createExpense: async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
    const response = await api.post<Expense>('/accounting/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (id: string, updateData: Partial<Expense>): Promise<Expense> => {
    const response = await api.put<Expense>(`/accounting/expenses/${id}`, updateData);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/accounting/expenses/${id}`);
  },

  getExpensesSummary: async (): Promise<{ summaryByCategory: Record<string, number>; totalExpenses: number }> => {
    const response = await api.get<{ summaryByCategory: Record<string, number>; totalExpenses: number }>('/accounting/expenses/summary');
    console.log(response.data)
    return response.data;
  },
};