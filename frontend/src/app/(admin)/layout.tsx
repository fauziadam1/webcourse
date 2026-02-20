"use client";

import { useAuthUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { PropsWithChildren, useEffect } from "react";
import { Header } from "@/components/header";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuthUser();
  const router = useRouter();

  if (user && user.role !== "admin") {
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="py-10">{children}</div>
    </>
  );
}
