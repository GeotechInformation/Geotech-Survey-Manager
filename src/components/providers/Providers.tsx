// Providers.tsx

'use client';

import { AuthProvider } from "./AuthProvider";
import { NotificationProvider } from "./NotificationProvider";
import { SettingsProvider } from "./SettingsProvider";
import { ThemeProvider } from "./ThemeProvider";

// Interface for the ThemeProvider props
interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}