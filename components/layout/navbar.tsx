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
import { FeedbackWidget } from "@/components/layout/feedback-widget";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const { dict, path } = useI18n();

  const navLinks = [
    { href: "/features", label: dict.nav.features },
    { href: "/games", label: dict.nav.games },
    { href: "/pricing", label: dict.nav.pricing },
    { href: "/#faq", label: dict.nav.faq },
    { href: "/live", label: dict.nav.live },
    { href: "/calendar", label: dict.nav.calendar },
    { href: "/dashboard", label: dict.nav.dashboard },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        <Link href={path("/")} className="flex items-center gap-2 font-semibold">
          <div className="rounded-lg bg-white p-2 text-black">
            <Bell className="h-4 w-4" />
          </div>
          <span className="text-lg">ModeAlert</span>
        </Link>

        <nav className="ml-10 hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={path(link.href)} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {isAuthed && <FeedbackWidget />}
          {isAuthed && <NotificationBell />}

          {isAuthed ? (
            <>
              <Link
                href={path("/dashboard/settings")}
                className="text-sm text-zinc-400 hover:text-white"
              >
                {session.user?.name ?? session.user?.email}
              </Link>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => signOut({ callbackUrl: path("/") })}
              >
                {dict.nav.signOut}
              </Button>
            </>
          ) : (
            <>
              <Link href={path("/signin")}>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  {dict.nav.signIn}
                </Button>
              </Link>
              <Link href={path("/onboarding")}>
                <Button className="bg-white text-black hover:bg-zinc-200">
                  {dict.nav.getStarted}
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
                aria-label={dict.nav.openMenu}
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
                {navLinks.map((link) => (
                  <DrawerClose
                    key={link.href}
                    render={
                      <Link
                        href={path(link.href)}
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
                          href={path("/dashboard/settings")}
                          className="flex h-9 w-full items-center justify-center rounded-lg border border-white/10 text-sm font-medium text-white hover:bg-white/10"
                        />
                      }
                    >
                      {dict.nav.settings}
                    </DrawerClose>
                    <Button
                      variant="ghost"
                      className="w-full justify-center border border-white/10 text-white hover:bg-white/10"
                      onClick={() => signOut({ callbackUrl: path("/") })}
                    >
                      {dict.nav.signOut}
                    </Button>
                  </>
                ) : (
                  <>
                    <DrawerClose
                      render={
                        <Link
                          href={path("/signin")}
                          className="flex h-9 w-full items-center justify-center rounded-lg border border-white/10 text-sm font-medium text-white hover:bg-white/10"
                        />
                      }
                    >
                      {dict.nav.signIn}
                    </DrawerClose>
                    <DrawerClose
                      render={
                        <Link
                          href={path("/onboarding")}
                          className="flex h-9 w-full items-center justify-center rounded-lg bg-white text-sm font-medium text-black hover:bg-zinc-200"
                        />
                      }
                    >
                      {dict.nav.getStarted}
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
