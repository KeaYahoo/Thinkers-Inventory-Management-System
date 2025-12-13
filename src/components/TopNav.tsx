"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  LayoutDashboard,
  Package,
  Repeat,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";

const navItems = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", Icon: Package },
  { href: "/alerts", label: "Alerts", Icon: Bell },
  { href: "/consumption", label: "Consumption", Icon: ShoppingCart },
  { href: "/vehicles", label: "Vehicles", Icon: Truck },
  { href: "/transfers", label: "Transfers", Icon: Repeat },
  { href: "/suppliers", label: "Suppliers", Icon: Users },
  { href: "/reports", label: "Reports", Icon: FileText },
  { href: "/settings", label: "Settings", Icon: Settings },
];

const isActive = (path: string, href: string) => {
  if (href === "/") return path === "/";
  return path.startsWith(href);
};

export default function TopNav() {
  const pathname = usePathname();
  const { totalCount } = useLowStockAlerts();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/thinkers-logo.png"
            alt="Thinkers Afrika IMS"
            width={120}
            height={32}
            priority
          />
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-2 overflow-x-auto" aria-label="Primary navigation">
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            const showBadge = href === "/alerts" && totalCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-light text-brand shadow-sm"
                    : "text-primary-muted hover:bg-brand-light/60 hover:text-primary"
                }`}
              >
                <Icon size={18} aria-hidden />
                <span className="hidden md:inline">{label}</span>
                {showBadge && (
                  <span
                    className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                    aria-label={`${totalCount} low-stock alerts`}
                  >
                    {totalCount > 99 ? "99+" : totalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

