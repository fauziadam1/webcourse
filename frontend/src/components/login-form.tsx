"use client";

import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "./ui/form";
import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { PasswordInput } from "./ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, SetLoading] = useState(false);

  const formSchema = z.object({
    username: z.string().trim().min(1, "The username field is required"),
    password: z.string().trim().min(1, "The password field is required"),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    SetLoading(true);
    try {
      await api.get("/sanctum/csrf-cookie");
      await new Promise((resolve) => setTimeout(resolve, 100));
      await api.post("/api/login", data);

      toast.success("Login success");
      router.push("/");
      SetLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Login failed";
      toast.error(message);
      SetLoading(false);
    }
  };

  return (
    <div className="w-110 border px-10 py-10 rounded-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl">Login</h1>
            <p className="text-xs text-gray-500">
              Sign Up with your account to continue
            </p>
          </div>
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full rounded-xl">{isLoading ? <Spinner /> : ""} Login</Button>
          </div>
          <div className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Register
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
