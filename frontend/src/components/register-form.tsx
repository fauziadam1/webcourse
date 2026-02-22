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
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { PasswordInput } from "./ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordValidation } from "@/lib/password-validation";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [isLoading, SetLoading] = useState(false);
  const router = useRouter();

  const formSchema = z
    .object({
      username: z.string().trim().min(1, "The username field is required"),
      email: z.string().email().min(1, "The email field is required"),
      password: PasswordValidation,
      password_confirmation: z
        .string()
        .trim()
        .min(1, "The confirm password is required"),
    })
    .refine((values) => values.password === values.password_confirmation, {
      message: "The confirm password does not match",
      path: ["password_confirmation"],
    });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    SetLoading(true);
    try {
      await api.get("/sanctum/csrf-cookie");
      await new Promise((resolve) => setTimeout(resolve, 100));
      await api.post("/api/register", data);

      toast.success("Register success");
      router.push("/login");
      SetLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Register failed";
      toast.error(message);
      SetLoading(false);
    }
  };

  return (
    <div className="w-110 border px-10 py-10 rounded-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl">Register</h1>
            <p className="text-xs text-gray-500">Welcome to WebCourse</p>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
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
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full rounded-xl">
              {isLoading ? <Spinner /> : ""} Register
            </Button>
          </div>
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
