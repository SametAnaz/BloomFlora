/**
 * Public Site Layout
 * Wraps all public pages with header, footer, theme provider, and WhatsApp button
 */

import { CartDrawer } from '@/components/cart/cart-drawer';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';
import { CartProvider } from '@/lib/cart/cart-context';

import { initializeModules } from '@/modules';

import { getNavigationConfig } from '@/lib/navigation';
import { getSiteSettings } from '@/lib/settings/getSiteSettings';
import { ThemeProvider } from '@/lib/theme';
import { getActiveTheme } from '@/lib/theme/getTheme';

// Force dynamic rendering (uses cookies for Supabase)
export const dynamic = 'force-dynamic';

// Initialize modules on server
initializeModules();

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  // Fetch active theme, site settings, and navigation config in parallel
  const [theme, settings, navConfig] = await Promise.all([
    getActiveTheme(),
    getSiteSettings(),
    getNavigationConfig(),
  ]);

  // Build social links array from settings
  const socialLinks: { platform: 'instagram' | 'facebook' | 'twitter'; url: string }[] = [];
  if (settings.social_instagram) socialLinks.push({ platform: 'instagram', url: settings.social_instagram });
  if (settings.social_facebook) socialLinks.push({ platform: 'facebook', url: settings.social_facebook });
  if (settings.social_twitter) socialLinks.push({ platform: 'twitter', url: settings.social_twitter });

  return (
    <ThemeProvider initialTheme={theme}>
      <CartProvider>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <Header
          logoUrl="/circle-logo.png"
          siteName={settings.site_name}
          config={navConfig.header}
          whatsappNumber={settings.whatsapp_number}
        />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer
          siteName={settings.site_name}
          email={settings.contact_email}
          phone={settings.contact_phone}
          address={settings.contact_address}
          config={navConfig.footer}
          socialLinks={socialLinks}
        />

        {/* WhatsApp Floating Button */}
        <WhatsAppFloat
          phoneNumber={settings.whatsapp_number}
          message={settings.whatsapp_message}
          enabled={settings.whatsapp_enabled && !!settings.whatsapp_number}
        />

        {/* Cart Drawer */}
        <CartDrawer whatsappNumber={settings.whatsapp_number} />
      </div>
      </CartProvider>
    </ThemeProvider>
  );
}
