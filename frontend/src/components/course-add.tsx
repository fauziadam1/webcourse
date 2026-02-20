"use client";

import z from "zod";
import { useState } from "react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "./ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

export function CourseAdd({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [isLoading, SetLoading] = useState(false);

  const formCourse = z.object({
    title: z.string().trim().min(1, "The title field is required"),
    description: z.string().trim().min(1, "The title field is required"),
    is_published: z.boolean(),
  });

  type FormCourse = z.infer<typeof formCourse>;

  const form = useForm<FormCourse>({
    resolver: zodResolver(formCourse),
    defaultValues: {
      title: "",
      description: "",
      is_published: false,
    },
  });

  const addCourse = async (data: FormCourse) => {
    SetLoading(true);
    try {
      await api.post("/api/course", data);

      toast.success("Course created");
      onSuccess?.();
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Add course failed";
      toast.error(message);
      SetLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Course</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusIcon />
              New Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new Course</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(addCourse)}>
                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      {isLoading ? <Spinner /> : ""}Add
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
