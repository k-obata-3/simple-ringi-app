import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationToasts } from "@/components/ui/NotificationToasts";
import Header from "@/components/layout/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="app-body">
        <AuthProvider>
          <Header />
          <NotificationToasts />
          <main>
            <div className="py-2 ps-4 pe-4">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
