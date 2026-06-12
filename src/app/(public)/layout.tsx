import { SiteHeader } from "@/components/public/site-header";
import { BottomNav } from "@/components/public/bottom-nav";
import { SiteFooter } from "@/components/public/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
