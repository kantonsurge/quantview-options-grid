export interface OptionsFlow {
  time: string
  ticker: string
  dte: string
  callput: "CALL" | "PUT"
  totalpremium: number
  premium_formatted?: string
  price: number
  size: number
  is_sweep: string
  strike: number
  expiration: string
}

export interface FilterModel {
  [key: string]: {
    type: 'text' | 'number' | 'date' | 'boolean' | 'list' | 'range' | 'timeRange'
    filter: any
    filterType?: string
  }
}

export interface SortModel {
  colId: string
  sort: 'asc' | 'desc'
}

export interface QueryParams {
  startRow: number
  endRow: number
  sortModel: SortModel[]
  filterModel: FilterModel
}

export type ViewMode = 'compact' | 'standard'

