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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Category } from '@/@types/transactions'


export default function AddTransactionDialog({ categories }: { categories: Category[] }) {
    const [selectedCategory, setSelectedCategory] = useState<Category>({} as Category)
    const [isRecurring, setIsRecurring] = useState(false)
    const [numberOfRepetitions, setNumberOfRepetitions] = useState(1)
    const [transactionType, setTransactionType] = useState<'payment' | 'receipt'>('payment')
    const [date, setDate] = useState<Date>()
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const [formattedDate, setFormattedDate] = useState<string>('')

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

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate)
        if (selectedDate) {
            setFormattedDate(format(selectedDate, 'dd/MM/yyyy'))
        } else {
            setFormattedDate('')
        }
    }

    const handleCategorySelect = (currentValue: string) => {
        const selectedCat = categories.find(cat => cat.name === currentValue);
        setSelectedCategory(selectedCat || ({} as Category));
        setOpen(false);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Transação
                </Button>
            </DialogTrigger>
            <DialogContent className='overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Nome da transação</Label>
                        <Input id="descricao" name="descricao" required />
                    </div>
                    {/* Valor */}
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
                    {/* Vencimento */}
                    <div className="space-y-2">
                        <Label>Data de vencimento</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formattedDate && "text-muted-foreground"
                                    )}
                                >
                                    {formattedDate || <span>Selecione uma data</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {/* Tipo */}
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
                    {/* Categoria */}
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
                                    {selectedCategory.name || "Selecione a categoria..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Procurar categoria..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                                        <CommandGroup>
                                            {categories.map((category) => (
                                                <CommandItem
                                                    key={category.name}
                                                    onSelect={currentValue => handleCategorySelect(currentValue)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedCategory.name === category.name ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {category.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    {/* Repete? */}
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
                            <Label htmlFor="numberOfRepetitions">Número de vezes</Label>
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