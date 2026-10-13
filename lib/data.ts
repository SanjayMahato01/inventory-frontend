export type Product = {
  name: string
  sku: string
  category: string
  price: number
  quantity: number
  minimum: number
}

export type Transaction = {
  product: string
  type: 'Stock in' | 'Stock out'
  quantity: number
  date: string
  user: string
}

export const products: Product[] = [
  { name: 'Wireless Headphones', sku: 'WH-1000XM5', category: 'Electronics', price: 349.99, quantity: 8, minimum: 12 },
  { name: 'Ergonomic Office Chair', sku: 'OC-ERG-04', category: 'Furniture', price: 289, quantity: 24, minimum: 10 },
  { name: 'Mechanical Keyboard', sku: 'MK-PRO-87', category: 'Electronics', price: 129.99, quantity: 42, minimum: 15 },
  { name: 'Standing Desk Mat', sku: 'SDM-002', category: 'Accessories', price: 54.5, quantity: 6, minimum: 10 },
  { name: 'USB-C Hub 7-in-1', sku: 'HUB-7-001', category: 'Electronics', price: 69.99, quantity: 31, minimum: 12 },
]

export const transactions: Transaction[] = [
  { product: 'Wireless Headphones', type: 'Stock out', quantity: 4, date: 'Oct 12, 2026', user: 'Olivia Martin' },
  { product: 'Ergonomic Office Chair', type: 'Stock in', quantity: 12, date: 'Oct 11, 2026', user: 'Jackson Lee' },
  { product: 'Standing Desk Mat', type: 'Stock out', quantity: 3, date: 'Oct 10, 2026', user: 'Sophia Davis' },
  { product: 'Mechanical Keyboard', type: 'Stock in', quantity: 24, date: 'Oct 09, 2026', user: 'Liam Wilson' },
]