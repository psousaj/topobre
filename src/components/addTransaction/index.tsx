'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const categories = [
    'emprestimo', 'cartoes', 'terreno', 'agua', 'energia', 'moradia',
    'outros', 'evento', 'eletronicos', 'viagem', 'roupas', 'streams',
    'educação', 'saúde', 'transporte'
]

export default function AddTransactionDialog() {
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const newTransaction = {
            descricao: formData.get('descricao') as string,
            valor: Number(formData.get('valor')),
            dataVencimento: formData.get('dataVencimento') as string,
            categoria: selectedCategory,
            repeteMensalmente: Boolean(formData.get('repeteMensalmente')),
        }

        const res = await fetch('http://localhost:3001/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction),
        })

        if (res.ok) {
            router.refresh()
        } else {
            console.error('Failed to add transaction')
        }
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
                        <Input id="valor" name="valor" type="number" step="0.01" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dataVencimento">Data de vencimento</Label>
                        <Input id="dataVencimento" name="dataVencimento" type="date" required />
                    </div>

                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    type="button"
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="repeteMensalmente"
                            name="repeteMensalmente"
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="repeteMensalmente">Repete mensalmente?</Label>
                    </div>

                    <Button type="submit" className="w-full">
                        Adicionar Transação
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}