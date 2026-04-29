import './globals.css';
import { ConditionalLayout } from '@/components/ConditionalLayout';

export const metadata = {
  title: 'NOVA Store',
  description: 'Tu tienda de tecnología',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
