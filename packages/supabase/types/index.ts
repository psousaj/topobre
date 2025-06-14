import type { UserMapping } from '@topobre/typeorm'

export type Database = {
    public: {
        Tables: {
            "users-mapping": {
                Row: UserMapping
                Insert: UserMapping
                Update: UserMapping
            }
        }
    }
}
