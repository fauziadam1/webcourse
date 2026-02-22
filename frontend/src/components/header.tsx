"use client";

import Link from "next/link";
import { useAuthUser } from "@/lib/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { HeaderUser } from "./header-user";

export function Header() {
  const { user } = useAuthUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-10">
        <Link href="/" className="text-2xl font-bold">
          WebCourse
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="font-semibold space-x-6">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/course">Course</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {user ? (
          <HeaderUser user={user} />
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/login">Login</Link>
            </Button>

            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
