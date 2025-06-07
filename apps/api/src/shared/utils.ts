// utils/pagination.ts
import { FindManyOptions, ILike } from 'typeorm'

type PaginationParams<T> = {
    offset?: number
    limit?: number
    filters?: Partial<Record<keyof T, string>>
}

export function buildPaginationQuery<T>(
    query: PaginationParams<T>
): FindManyOptions<T> {
    const { offset = 0, limit = 10, filters = {} } = query

    const where: any = {}
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            where[key] = ILike(`%${value}%`) // suporte a busca textual
        }
    }

    return {
        where,
        skip: offset,
        take: limit,
    }
}
