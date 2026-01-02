'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, MessageSquare, Network, Menu, X, Upload, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navLinks = [
  { href: '/chat', label: 'Analyze', icon: MessageSquare },
  { href: '/graph', label: 'Explore', icon: Network },
  { href: '/ingest', label: 'Ingest', icon: Upload },
  { href: '/architecture', label: 'Architecture', icon: Workflow },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLanding = pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-default bg-bg-primary/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-text-primary hover:text-brand transition-colors"
          >
            <Scale className="h-6 w-6 text-brand" />
            <span className="text-lg font-semibold">Vulcan</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button (only on landing) */}
          <div className="hidden md:flex items-center gap-4">
            {isLanding && (
              <Button asChild>
                <Link href="/chat">
                  Get Started
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-bg-primary">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            {isLanding && (
              <Button asChild className="mt-2">
                <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
