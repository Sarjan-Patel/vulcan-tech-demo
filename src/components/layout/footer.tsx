import Link from 'next/link';
import { Scale } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Analyze', href: '/chat' },
    { label: 'Explore Graph', href: '/graph' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-text-primary">
              <Scale className="h-6 w-6 text-brand" />
              <span className="text-lg font-semibold">Vulcan</span>
            </Link>
            <p className="mt-4 text-sm text-text-muted max-w-xs">
              AI-powered legal conflict analysis for regulations and ordinances.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border-default">
          <p className="text-sm text-text-muted text-center">
            &copy; {new Date().getFullYear()} Vulcan Legal Tech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
