"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { NotificationBell } from "@/components/layout/notification-bell";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/games", label: "Games" },
  { href: "/#faq", label: "FAQ" },
  { href: "/live", label: "Live" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="rounded-lg bg-white p-2 text-black">
            <Bell className="h-4 w-4" />
          </div>
          <span className="text-lg">ModeAlert</span>
        </Link>

        <nav className="ml-10 hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {isAuthed && <NotificationBell />}

          {isAuthed ? (
            <>
              <Link
                href="/dashboard/settings"
                className="text-sm text-zinc-400 hover:text-white"
              >
                {session.user?.name ?? session.user?.email}
              </Link>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign in
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button className="bg-white text-black hover:bg-zinc-200">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <Drawer
          open={open}
          onOpenChange={setOpen}
          swipeDirection="right"
        >
          <DrawerTrigger
            render={
              <button
                type="button"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </DrawerTrigger>

          <DrawerContent className="border-l border-white/10 bg-black text-white">
            <div className="flex h-full flex-col p-6">
              <div className="flex items-center gap-2 font-semibold">
                <div className="rounded-lg bg-white p-2 text-black">
                  <Bell className="h-4 w-4" />
                </div>
                <span className="text-lg">ModeAlert</span>
              </div>

              <nav className="mt-10 flex flex-col gap-6 text-lg">
                {NAV_LINKS.map((link) => (
                  <DrawerClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="text-zinc-300 hover:text-white"
                      />
                    }
                  >
                    {link.label}
                  </DrawerClose>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3">
                {isAuthed ? (
                  <>
                    <DrawerClose
                      render={
                        <Link
                          href="/dashboard/settings"
                          className="flex h-9 w-full items-center justify-center rounded-lg border border-white/10 text-sm font-medium text-white hover:bg-white/10"
                        />
                      }
                    >
                      Settings
                    </DrawerClose>
                    <Button
                      variant="ghost"
                      className="w-full justify-center border border-white/10 text-white hover:bg-white/10"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <DrawerClose
                      render={
                        <Link
                          href="/signin"
                          className="flex h-9 w-full items-center justify-center rounded-lg border border-white/10 text-sm font-medium text-white hover:bg-white/10"
                        />
                      }
                    >
                      Sign in
                    </DrawerClose>
                    <DrawerClose
                      render={
                        <Link
                          href="/onboarding"
                          className="flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-medium text-black hover:bg-zinc-200"
                        />
                      }
                    >
                      Get Started
                    </DrawerClose>
                  </>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}
