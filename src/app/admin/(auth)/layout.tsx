/**
 * Admin Auth Layout
 * Simple layout for authentication pages (no sidebar)
 */

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}
