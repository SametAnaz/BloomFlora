/**
 * Public Site Layout
 * Wraps all public pages with header, footer, theme provider, and WhatsApp button
 */

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';

import { initializeModules } from '@/modules';

import { ThemeProvider } from '@/lib/theme';
import { getActiveTheme } from '@/lib/theme/getTheme';

// Initialize modules on server
initializeModules();

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  // Fetch active theme from Supabase
  const theme = await getActiveTheme();

  // TODO: Fetch site settings from Supabase
  const siteSettings = {
    siteName: 'Bloom Flora',
    logoUrl: '/circle-logo.png',
    whatsapp: {
      enabled: true,
      phoneNumber: '905551234567', // Replace with actual number
      message: 'Merhaba, bilgi almak istiyorum.',
    },
    contact: {
      email: 'bloomflorarize@gmail.com',
      phone: '+90 555 123 45 67',
      address: 'Müftü Mahallesi, Stadyum Sokak No: 32/A, Rize',
    },
    social: [
      { platform: 'instagram' as const, url: 'https://instagram.com/bloomflora' },
    ],
  };

  return (
    <ThemeProvider initialTheme={theme}>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <Header
          logoUrl={siteSettings.logoUrl}
          siteName={siteSettings.siteName}
        />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer
          siteName={siteSettings.siteName}
          email={siteSettings.contact.email}
          phone={siteSettings.contact.phone}
          address={siteSettings.contact.address}
          socialLinks={siteSettings.social}
        />

        {/* WhatsApp Floating Button */}
        <WhatsAppFloat
          phoneNumber={siteSettings.whatsapp.phoneNumber}
          message={siteSettings.whatsapp.message}
          enabled={siteSettings.whatsapp.enabled}
        />
      </div>
    </ThemeProvider>
  );
}
