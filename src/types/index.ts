export interface ProcessRow {
  mes: string
  setor: string
  codigoItem?: string;
  item: string
  total: number
  qty: number
  price: number
  sit: string
  rm: string
}

export interface ApiResponse {
  rows: ProcessRow[]
  updatedAt: string
  sheets: string[]
}

export type FilterMonth = 'ALL' | string
