import { Category, Transaction } from '@/types/transactions'
import { ApiResponse } from '@/types/api'
import { fetcher } from './fetcher'

export async function getTransactions(): Promise<ApiResponse<Transaction[]>> {
  return await fetcher('/transactions', {
    method: 'GET',
    cache: 'no-store',
    next: { tags: ['transactions'] },
    credentials: 'include'
  })
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return await fetcher('/categories', {
    method: 'GET',
    cache: 'no-store',
    next: { tags: ['categories'] },
    credentials: 'include'
  })
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<ApiResponse<Transaction>> {
  return await fetcher('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
    credentials: 'include'
  })
}

export async function updateTransaction(transaction: Transaction): Promise<ApiResponse<Transaction>> {
  return await fetcher(`/transactions/${transaction.id}`, {
    method: 'PUT',
    body: JSON.stringify(transaction),
    credentials: 'include'
  })
}

export async function deleteTransaction(id: number): Promise<ApiResponse<void>> {
  return await fetcher(`/transactions/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
}