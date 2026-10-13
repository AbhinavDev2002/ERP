import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppThemeProvider } from "@erp/ui";

import { QueryProvider } from "@/shared/query/query-provider";

export const metadata: Metadata = {
  title: "ERP",
  description: "Sign in and work in your organization",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
