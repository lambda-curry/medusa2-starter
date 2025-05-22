/**
 * Common type declarations for page builder
 */

export type PostStatus = 'draft' | 'published' | 'archived'

export type PostType = 'page' | 'post'

export type PostContentMode = 'basic' | 'advanced'

// These would be defined in the implementation file
export declare const postStatuses: readonly PostStatus[]
export declare const postTypes: readonly PostType[]
export declare const postContentModes: readonly PostContentMode[]

export interface SortOptions {
  sort?: string
  order?: 'ASC' | 'DESC'
}

export interface PaginationOptions {
  limit?: number
  offset?: number
}

export interface FilterOptions {
  q?: string
  [key: string]: unknown
}

export type QueryOptions = SortOptions & PaginationOptions & FilterOptions

export interface FindConfig<T> extends QueryOptions {
  select?: (keyof T)[]
  relations?: string[]
  where?: { [K in keyof T]?: T[K] | T[K][] } & {
    [key: string]: unknown
  }
}
