import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionTable } from '@/components/transaction/transaction-table'

export default function TransactionsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Transactions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A complete record of every stock movement.
        </p>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Transaction history</CardTitle>
          <CardDescription>A complete record of every stock movement.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable />
        </CardContent>
      </Card>
    </>
  )
}