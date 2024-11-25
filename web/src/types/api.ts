export interface ApiResponse<T> {
    result: T | null;
    error: { message: string } | null;
} 