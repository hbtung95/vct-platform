import { StylesProvider } from './styles-provider'
import { VCT_AppShell } from 'app/features/layout/AppShell'
import './globals.css'

export const metadata = {
  title: 'VCT PLATFORM - Võ Cổ Truyền',
  description: 'Nền tảng quản lý và điều hành giải võ cổ truyền',
}

export default function RootLayout({
  children,
}: {
  children: any
}) {
  return (
    <html lang="vi">
      <body>
        <StylesProvider>
          <VCT_AppShell>
            {children}
          </VCT_AppShell>
        </StylesProvider>
      </body>
    </html>
  )
}
