import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Link, useLocation } from 'wouter';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Building2, Settings, UserRound, ChevronDown, Menu, X, CreditCard, FileText, LifeBuoy, WalletCards } from 'lucide-react';
import { Assistant } from './assistant';
import { cn } from '@/lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAccessibilityMode, setIsAccessibilityMode, preferences } = useStore();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDistractionFree = isAccessibilityMode && preferences.reducedDistractions;
  const modeLabel = `Cognitive Mode — ${isAccessibilityMode ? 'ON' : 'OFF'}`;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      {!isAccessibilityMode && (
        <div className="hidden bg-[#76004f] text-white sm:block">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-xs">
            <div className="flex items-center gap-6">
              <span className="font-medium">Personal Banking</span>
              <span className="text-white/70">Business Banking</span>
              <span className="text-white/70">About Commercial Bank International</span>
            </div>
            <span className="text-white/80">UAE · English</span>
          </div>
        </div>
      )}
      <header className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors",
        !isAccessibilityMode && "border-[#dfe4ec] bg-white",
        isAccessibilityMode && "border-primary/20 bg-card"
      )}>
        <div className={cn("container mx-auto px-4 h-16 flex items-center justify-between gap-2", !isAccessibilityMode && "max-w-7xl")}>
          {!isAccessibilityMode && (
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#26364b] transition hover:bg-[#f4f6f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#92005c] md:hidden"
              aria-label={menuOpen ? "Close banking menu" : "Open banking menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm md:flex-none">
            <div className={cn(
              "shrink-0 p-1.5 rounded-lg transition-colors",
              isAccessibilityMode ? "bg-primary text-primary-foreground group-hover:bg-primary/90" : "bg-[#0b3b78] text-white group-hover:bg-[#082f60]"
            )}>
              <Building2 className="h-5 w-5" />
            </div>
            <span className={cn(
              "font-semibold tracking-tight",
              isAccessibilityMode ? "text-lg" : "max-w-[104px] whitespace-normal text-[11px] leading-[1.05] sm:max-w-none sm:text-lg"
            )}>
              Commercial Bank International
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {!isAccessibilityMode && (
              <nav className="hidden items-center gap-7 text-sm font-medium text-[#26364b] lg:flex" aria-label="Primary">
                <Link href="/" className="border-b-2 border-[#92005c] py-5 text-[#92005c]">Accounts</Link>
                <span className="flex items-center gap-1 text-[#4d5b6e]">Payments <ChevronDown className="h-3.5 w-3.5" /></span>
                <span className="flex items-center gap-1 text-[#4d5b6e]">Cards <ChevronDown className="h-3.5 w-3.5" /></span>
                <span className="text-[#4d5b6e]">Support</span>
              </nav>
            )}
            {!isDistractionFree && (
              <Link href="/settings" className={cn(
                "text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1",
                !isAccessibilityMode && "text-[#4d5b6e] hover:text-[#76004f]"
              )}>
                <Settings className="h-5 w-5" />
              </Link>
            )}

            {!isAccessibilityMode && (
              <div className="hidden items-center gap-2 border-l border-[#e2e6ed] pl-5 md:flex">
                <UserRound className="h-4 w-4 text-[#76004f]" />
                <span className="text-sm font-semibold text-[#26364b]">Alex Morgan</span>
              </div>
            )}

            <div className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 sm:gap-3 sm:px-3",
              isAccessibilityMode ? "bg-muted/50 border-border/50" : "border-[#dfe4ec] bg-[#f5f7fa]"
            )}>
              <Label htmlFor="accessibility-toggle" className="cursor-pointer whitespace-nowrap text-[11px] font-medium sm:text-sm">
                {modeLabel}
              </Label>
              <Switch
                id="accessibility-toggle"
                data-testid="toggle-accessibility"
                checked={isAccessibilityMode}
                onCheckedChange={setIsAccessibilityMode}
              />
            </div>
          </div>
        </div>
      </header>

      {!isAccessibilityMode && menuOpen && (
        <div className="fixed inset-0 top-[64px] z-30 bg-white md:hidden" onClick={() => setMenuOpen(false)}>
          <nav
            aria-label="Banking menu"
            className="min-h-[calc(100dvh-64px)] border-b border-[#dfe4ec] bg-white px-4 pb-8 pt-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-[#eef1f5] pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#76004f]">Main menu</p>
              <span className="text-xs text-[#7a8797]">Commercial Bank International</span>
            </div>
            <div className="grid gap-1">
              <MobileMenuLink href="/" label="Accounts" icon={<Building2 className="h-5 w-5" />} onClick={() => setMenuOpen(false)} />
              <MobileMenuLink href="/transfer/recipient" label="Transfers" icon={<WalletCards className="h-5 w-5" />} onClick={() => setMenuOpen(false)} />
              <MobileMenuItem label="Payments" icon={<CreditCard className="h-5 w-5" />} />
              <MobileMenuItem label="Cards" icon={<WalletCards className="h-5 w-5" />} />
              <MobileMenuItem label="Statements" icon={<FileText className="h-5 w-5" />} />
              <MobileMenuLink href="/settings" label="Settings" icon={<Settings className="h-5 w-5" />} onClick={() => setMenuOpen(false)} />
              <MobileMenuItem label="Support" icon={<LifeBuoy className="h-5 w-5" />} />
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 container mx-auto flex w-full flex-col px-4 py-5 sm:px-6 sm:py-8",
        isAccessibilityMode ? "max-w-3xl" : "max-w-7xl"
      )}>
        {children}
      </main>

      <Assistant />
    </div>
  );
}

function MobileMenuLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-[#26364b] transition hover:bg-[#f7eaf2] hover:text-[#76004f]">
      <span className="text-[#76004f]">{icon}</span>
      {label}
    </Link>
  );
}

function MobileMenuItem({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-[#26364b]">
      <span className="text-[#0b3b78]">{icon}</span>
      {label}
    </div>
  );
}
