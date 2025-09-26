import { api } from "@/lib/api";

export interface Expense {
  id: number;
  amount: number;
  date: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  approvedById: number | null;
  updatedById: number | null;
  expenseCategoryId: number;
  expenseCategory: {
    id: number;
    name: string;
  };
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
  getExpenses: async (params?: { categoryId?: string; status?: string; search?: string; date?: string; startDate?: string; endDate?: string }): Promise<{ totalExpenses: number; dailyBreakdown: DailyBreakdown[] } | Expense[]> => {
    const response = await api.get<{ totalExpenses: number; dailyBreakdown: DailyBreakdown[] } | Expense[]>('/accounting/expenses', { params });
    console.log(response.data)
    return response.data;
  },

  createExpense: async (expenseData: {
    amount: number;
    date: string;
    notes: string | null;
    expenseCategoryId: number;
  }): Promise<Expense> => {
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

  getExpenseCategories: async (): Promise<{ data: Array<{ id: number; name: string }> }> => {
    const response = await api.get<{ data: Array<{ id: number; name: string }> }>('/accounting/expense-categories');
    return response.data;
  },

  createExpenseCategory: async (categoryData: { name: string }): Promise<{ id: number; name: string }> => {
    const response = await api.post<{ id: number; name: string }>('/accounting/expense-categories', categoryData);
    return response.data;
  },
};