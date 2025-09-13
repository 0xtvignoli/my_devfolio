'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/use-locale';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Code2, LayoutGrid, Briefcase, BookOpen, FlaskConical, Trophy } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { HamburgerMenu } from './hamburger-menu';
import { motion } from 'framer-motion';

export function Header() {
  const { t } = useLocale();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Trophy },
    { href: '/portfolio', label: t.nav.portfolio, icon: LayoutGrid },
    { href: '/experience', label: t.nav.experience, icon: Briefcase },
    { href: '/articles', label: t.nav.articles, icon: BookOpen },
    { href: '/lab', label: t.nav.lab, icon: FlaskConical },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 select-none">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">DevOps Folio</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <HamburgerMenu isOpen={isSheetOpen} onToggle={setIsSheetOpen} />
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>
                      A list of links to navigate the site, including portfolio, experience, articles, and the lab.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col h-full pt-4">
                    <div className="p-2 mb-4 px-4">
                       <Link href="/" className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                        <Code2 className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-lg">DevOps Folio</span>
                      </Link>
                    </div>
                    <nav className="flex-grow px-2">
                      <ul className="space-y-2">
                        {navLinks.map((link) => (
                          <li key={link.href}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Link
                                href={link.href}
                                onClick={() => setIsSheetOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
                              >
                                <link.icon className="w-5 h-5" />
                                <span className="font-medium">{link.label}</span>
                              </Link>
                            </motion.div>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <div className="mt-auto flex items-center justify-start space-x-2 p-4 border-t">
                      <LocaleSwitcher />
                      <ThemeToggle />
                    </div>
                  </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
