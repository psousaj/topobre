'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HelpCircle, Tag, Trash2, Check, ChevronsUpDown, Bookmark } from 'lucide-react'
import Image from "next/image"
import AddTransactionDialog from '@/components/AddTransactionDialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { WelcomeUserNotification } from '@/components/NotificationBanner'
import { UserButton } from '@clerk/nextjs'
import { Category, Transaction } from '@/@types/transactions'
import { API_URL } from '@/env'
import { toast } from 'sonner'

// Função para capitalizar a primeira letra de cada palavra
const capitalize = (str: string) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)
  const [formattedValue, setFormattedValue] = useState('')

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch(`${API_URL}/transactions`, {
        cache: 'no-store',
        next: { tags: ['transactions'] },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch transactions')
      if (!res.ok) {
        const r = await res.json()
        toast.error(`Erro ao buscar Transações: ${r.message}`, { closeButton: true })
        return
      }
      const data = await res.json()
      setTransactions(data)
    }

    const fetchCategories = async () => {
      const res = await fetch(`${API_URL}/categories`, {
        cache: 'no-store',
        next: { tags: ['categories'] },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch categories')
      if (!res.ok) {
        const r = await res.json()
        toast.error(`Erro ao buscar categorias salvas: ${r.message}`, { closeButton: true })
        return
      }
      const data = await res.json()
      setCategories(data)
    }

    fetchTransactions()
    fetchCategories()
  }, [])

  useEffect(() => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.dueDate);
      return (
        transactionDate.getMonth() + 1 === selectedMonth &&
        (categoryFilter === null || transaction.categoryId === categoryFilter.id)
      );
    });
    setFilteredTransactions(filtered);
  }, [selectedMonth, transactions, categoryFilter]);

  const calculateSummary = () => {
    const filtered = filteredTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.dueDate);
      return (
        transactionDate.getMonth() + 1 === selectedMonth &&
        (categoryFilter === null || transaction.categoryId === categoryFilter?.id)
      );
    });

    const payments = filtered
      .filter(t => t.transactionType === 'payment')
      .reduce((sum, t) => sum + Math.abs(t.transactionValue), 0);

    const receipts = filtered
      .filter(t => t.transactionType === 'receipt')
      .reduce((sum, t) => sum + t.transactionValue, 0);

    const balance = receipts - payments;

    return { payments, receipts, balance };
  }

  const { payments, receipts, balance } = calculateSummary()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setFormattedValue(formatCurrency(Math.abs(transaction.transactionValue)))
    setIsDrawerOpen(true)
  }

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    const res = await fetch(`${API_URL}/transactions/${updatedTransaction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTransaction),
    })

    if (!res.ok) {
      const r = await res.json()
      toast.error(`Erro ao atualizar: ${r.message}`, { closeButton: true })
      return
    }

    if (res.ok) {
      setTransactions(prevTransactions =>
        prevTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      )
      setIsDrawerOpen(false)
    } else {
      console.error('Failed to update transaction')
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const r = await res.json()
      toast.error(`Erro ao deletar: ${r.message}`, { closeButton: true })
      return
    }

    if (res.ok) {
      setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id))
      setIsDrawerOpen(false)
    } else {
      console.error('Failed to delete transaction')
    }
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    value = (Number(value) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    setFormattedValue(value)

    // Atualiza o valor real na transação (removendo formatação)
    const numericValue = Number(value.replace(/\D/g, '')) / 100
    setSelectedTransaction(prev =>
      prev ? {
        ...prev,
        valor: numericValue * (prev.transactionType === 'payment' ? -1 : 1)
      } : null
    )
  }

  return (
    // <div className="min-h-screen bg-[#eeeef3] bg-opacity-50 p-4">
    <div className="min-h-scree w-full bg-opacity-50 p-4">
      <div className="mx-auto min-w-4xl w-[90%] rounded-xl bg-white bg-opacity-75 p-4 shadow-sm">
        {/* Header */}
        <header className="flex items-center justify-between bg-[#32CD32] p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/img/carteira-icon.png"
              alt="Pocket Flow Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-white">Pocket Flow</span>
          </div>
          <UserButton />
          {/* <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button> */}
        </header>

        {/* Notification Banner */}
        <WelcomeUserNotification />

        {/* Summary Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Resumo de {monthNames[selectedMonth - 1]}/{new Date().getFullYear()}</h2>
            <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 bg-red-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Pagamentos</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(payments)}</p>
                </div>
                <HelpCircle className="h-5 w-5 text-red-400" />
              </div>
            </Card>

            <Card className="p-4 bg-green-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Recebimentos</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(receipts)}</p>
                </div>
                <HelpCircle className="h-5 w-5 text-green-400" />
              </div>
            </Card>

            <Card className="p-4 bg-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                <HelpCircle className="h-5 w-5 text-blue-400" />
              </div>
            </Card>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transações</h2>
            {/* Header Transactions Section */}
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-between">
                    {categoryFilter?.name || "Filtrar por categoria"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Pesquisar categoria..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.id}
                            onSelect={(currentValue) => {
                              setCategoryFilter(currentValue === categoryFilter?.id ? null : categories.find(cat => cat.id === currentValue) || {} as Category)
                            }}
                          >
                            <Bookmark rotate={90} fill='#181818' color={category.color} fillOpacity={categoryFilter?.id === category.id ? 100 : 0} />
                            {capitalize(category.name)}
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                categoryFilter?.id === category.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <AddTransactionDialog categories={categories} />
            </div>
          </div>

          {/* Transaction List */}
          <Card className="h-[300px]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {filteredTransactions.map((transaction) => {
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-slate-200 rounded-lg cursor-pointer hover:bg-slate-300"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold">{transaction.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Tag className="w-4 h-4 mr-1" fill={transaction.category.color} color='black' />
                            <span>{capitalize(transaction.category.name)}</span>
                            <span className="mx-1">-</span>
                            <span>{new Date(transaction.dueDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.transactionType === 'receipt' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(transaction.transactionValue))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Transaction Details Drawer */}
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <DrawerContent className='w-3/4 mx-auto'>
          <DrawerHeader>
            <DrawerTitle>Detalhes da Transação</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => handleDeleteTransaction(selectedTransaction?.id ?? 0)}
            >
              <Trash2 color='red' className="h-5 w-5" />
            </Button>
          </DrawerHeader>
          {selectedTransaction && (
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={selectedTransaction.description}
                  onChange={(e) => setSelectedTransaction({ ...selectedTransaction, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  value={formattedValue || formatCurrency(Math.abs(selectedTransaction?.transactionValue || 0))}
                  onChange={handleValueChange}
                />
              </div>
              <div>
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={selectedTransaction.dueDate}
                  onChange={(e) => setSelectedTransaction({ ...selectedTransaction, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={selectedTransaction.categoryId}
                  onValueChange={(value) => setSelectedTransaction({ ...selectedTransaction, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={selectedTransaction.transactionType}
                  onValueChange={(value: 'payment' | 'receipt') => setSelectedTransaction({ ...selectedTransaction, transactionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Pagamento</SelectItem>
                    <SelectItem value="receipt">Recebimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DrawerFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancelar</Button>
              <Button onClick={() => selectedTransaction && handleUpdateTransaction(selectedTransaction)}>Salvar</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}