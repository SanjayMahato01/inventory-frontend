import type { Metadata, Viewport } from 'next'
import './globals.css'
import StoreProvider from './StoreProvider'

export const metadata: Metadata = {
  title: 'Inventory — Inventory management',
  description: 'Track products, stock movements, and low-stock alerts in one workspace.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
