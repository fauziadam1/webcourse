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
import { Textarea } from "./ui/textarea";
import { Spinner } from "./ui/spinner";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

export function LessonAdd({
  setId,
  onSuccess,
}: {
  setId: string;
  onSuccess?: () => void;
}) {
  const [isLoading, SetLoading] = useState(false);

  const formLesson = z.object({
    title: z.string().trim().min(1, "Title is required"),
    content: z.string().trim().min(1, "Content is required"),
  });

  type FormLesson = z.infer<typeof formLesson>;

  const form = useForm<FormLesson>({
    resolver: zodResolver(formLesson),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const addLesson = async (data: FormLesson) => {
    SetLoading(true);
    try {
      await api.post("/api/lesson", {
        ...data,
        set_id: setId,
      });

      toast.success("Lesson created");

      onSuccess?.();
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Add lesson failed";
      toast.error(message);
    } finally {
      SetLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <PlusIcon />
          New Lesson
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new lesson</DialogTitle>
          <DialogDescription>Create lesson inside this set</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(addLesson)}>
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {isLoading && <Spinner />}
                Add Lesson
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
