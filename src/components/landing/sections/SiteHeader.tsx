"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/BrandMark";
import { NAV_LINKS } from "../landing-content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="landing-shell flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <BrandMark
            variant="icon"
            surface="onDark"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 lg:hidden"
            priority
          />
          <BrandMark
            variant="horizontal"
            surface="onDark"
            width={200}
            height={40}
            className="hidden h-9 w-auto max-w-[200px] lg:block"
            priority
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="font-semibold">
            <Link href="/login">Deploy to field</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="w-full font-semibold">
                <Link href="/login">Deploy to field</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
