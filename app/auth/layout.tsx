import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main className="min-h-screen bg-[#FBF6F0] dark:bg-neutral-950">{children}</main>
      <Toaster position="top-center" reverseOrder={false} />
    </ThemeProvider>
  );
}
