'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Check, ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

const categories = [
    'emprestimo', 'cartoes', 'terreno', 'agua', 'energia', 'moradia',
    'outros', 'evento', 'eletronicos', 'viagem', 'roupas', 'streams',
    'educação', 'saúde', 'transporte'
]

export default function AddTransactionDialog() {
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [isRecurring, setIsRecurring] = useState(false)
    const [numberOfRepetitions, setNumberOfRepetitions] = useState(1)
    const [transactionType, setTransactionType] = useState<'payment' | 'receipt'>('payment')
    const [date, setDate] = useState<Date>()
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const baseTransaction = {
            descricao: formData.get('descricao') as string,
            valor: Number(value.replace('R$ ', '').replace(',', '.')) * (transactionType === 'payment' ? -1 : 1),
            dataVencimento: date?.toISOString().split('T')[0] || '',
            categoria: selectedCategory,
            repeteMensalmente: isRecurring,
            tipo: transactionType
        }

        const transactions = []

        for (let i = 0; i < (isRecurring ? numberOfRepetitions : 1); i++) {
            const transactionDate = new Date(baseTransaction.dataVencimento)
            transactionDate.setMonth(transactionDate.getMonth() + i)

            transactions.push({
                ...baseTransaction,
                dataVencimento: transactionDate.toISOString().split('T')[0],
            })
        }

        for (const transaction of transactions) {
            const res = await fetch('http://localhost:3001/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction),
            })

            if (!res.ok) {
                console.error('Failed to add transaction')
                return
            }
        }

        router.refresh()
    }

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '')
        value = (Number(value) / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        })
        setValue(value)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Transação
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Nome da transação</Label>
                        <Input id="descricao" name="descricao" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="valor">Valor da transação</Label>
                        <Input
                            id="valor"
                            name="valor"
                            value={value}
                            onChange={handleValueChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Data de vencimento</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    {date ? format(date, "PPP") : <span>Selecione uma data</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transactionType">Tipo de transação</Label>
                        <Select value={transactionType} onValueChange={(value: 'payment' | 'receipt') => setTransactionType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de transação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payment">Pagamento</SelectItem>
                                <SelectItem value="receipt">Recebimento</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {selectedCategory || "Selecione a categoria..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Procurar categoria..." />
                                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                                    <CommandGroup>
                                        {categories.map((category) => (
                                            <CommandItem
                                                key={category}
                                                onSelect={(currentValue) => {
                                                    setSelectedCategory(currentValue === selectedCategory ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCategory === category ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {category}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="repeteMensalmente"
                            checked={isRecurring}
                            onCheckedChange={setIsRecurring}
                        />
                        <Label htmlFor="repeteMensalmente">Repete mensalmente?</Label>
                    </div>

                    {isRecurring && (
                        <div className="space-y-2">
                            <Label htmlFor="numberOfRepetitions">Número de repetições</Label>
                            <Input
                                id="numberOfRepetitions"
                                type="number"
                                min="1"
                                value={numberOfRepetitions}
                                onChange={(e) => setNumberOfRepetitions(parseInt(e.target.value))}
                            />
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        Adicionar Transação
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}