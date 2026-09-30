import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = { title: "kanx-ai4s-master" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={cn("dark font-sans", geist.variable)}>
      <body>
        <Providers>
          <TooltipProvider>{children}<Toaster /></TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
