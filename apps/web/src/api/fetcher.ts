'use server'
import { cookies } from 'next/headers'

export async function fetcher(
    path: string,
    options: RequestInit = {},
    auth: boolean = true
) {
    const session = await cookies()
    const sessionCookie = session.get('__session')?.value

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(auth && { Authorization: `Bearer ${sessionCookie}` }),
                ...options.headers,
            },
            credentials: 'include'
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            return {
                result: null,
                error: errorData || { message: `Error: ${response.status} ${response.statusText}` }
            }
        }

        const data = await response.json()
        return { result: data, error: null }
    } catch (error) {
        return {
            result: null,
            error: { message: error instanceof Error ? error.message : 'Erro na requisição' }
        }
    }
} 