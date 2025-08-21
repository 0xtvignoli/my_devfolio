
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  Briefcase,
  User,
  Newspaper,
  Send,
  Home,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { person } from "@/lib/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/lab", label: "Lab", icon: FlaskConical },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/articles", label: "Articles", icon: Newspaper },
  { href: "/about", label: "About", icon: User },
  { href: "/contact", label: "Contact", icon: Send },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col justify-between">
      <ul className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-active hover:text-sidebar-active-foreground",
                  isActive
                    ? "bg-sidebar-active text-sidebar-active-foreground"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-sidebar-border pt-4">
        <Link href="/about" className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
             <AvatarFallback className="bg-primary text-primary-foreground">
              {person.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-sidebar-active-foreground">
              {person.name}
            </p>
          </div>
        </Link>
      </div>
    </nav>
  );
}
