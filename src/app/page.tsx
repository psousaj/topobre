import { use } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Menu, Plus, HelpCircle } from 'lucide-react'
import Image from "next/image"
import AddTransactionDialog from '@/components/addTransaction'
import { WelcomeUserNotification } from '@/components/NotificationBanner'

type Transaction = {
  id: number
  valor: number
  dataVencimento: string
  descricao: string
  categoria: string
  repeteMensalmente: boolean
}

async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch('http://localhost:3001/transactions', {
    cache: 'no-store',
    next: { tags: ['transactions'] }
  })
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

export default function Page() {
  const transactions = use(fetchTransactions())

  return (
    <div className="min-h-screen min-w-full flex flex-col justify-between gap-4">
      <div className="mx-auto max-w-4xl rounded-xl bg-white bg-opacity-80 p-4 shadow-sm">
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
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <WelcomeUserNotification />

        {/* Summary Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Resumo de outubro/2024</h2>
            <Button variant="outline" size="sm" className="text-yellow-600">
              mês anterior <span className="ml-1">↓</span>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 bg-red-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Pagamentos</p>
                  <p className="text-2xl font-bold text-red-600">R$ 1.700,69</p>
                </div>
                <HelpCircle className="h-5 w-5 text-red-400" />
              </div>
            </Card>

            <Card className="p-4 bg-green-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Recebimentos</p>
                  <p className="text-2xl font-bold text-green-600">R$ 4.306,23</p>
                </div>
                <HelpCircle className="h-5 w-5 text-green-400" />
              </div>
            </Card>

            <Card className="p-4 bg-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 429,54</p>
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
            <AddTransactionDialog />
          </div>

          {/* Transaction List */}
          <Card className="h-[300px]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{transaction.descricao}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.dataVencimento).toLocaleDateString('pt-BR')} - {transaction.categoria}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.valor > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {Math.abs(transaction.valor).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.repeteMensalmente ? 'Mensal' : 'Única'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}