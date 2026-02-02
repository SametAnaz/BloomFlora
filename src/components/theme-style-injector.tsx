/**
 * Theme Style Injector
 * Injects theme CSS variables into the document head via SSR
 */

import { generateThemeStyleTag } from '@/lib/theme/applyTheme';
import { getActiveTheme } from '@/lib/theme/getTheme';

export async function ThemeStyleInjector() {
  const theme = await getActiveTheme();
  const styleContent = generateThemeStyleTag(theme);

  return (
    <style
      id="theme-variables"
      dangerouslySetInnerHTML={{ __html: styleContent }}
    />
  );
}
