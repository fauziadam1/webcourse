"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { CourseAdd } from "./course-add";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { EllipsisVertical, PencilIcon, Trash2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";

type Course = {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
};

export function CourseList() {
  const [isLoading, SetLoading] = useState(false);
  const [isEditLoading, SetEditLoading] = useState(false);
  const [isPubLoading, setPubLoading] = useState<number | null>(null);
  const [courses, setCourse] = useState<Course[]>([]);

  const formSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const [editId, setEditId] = useState<number | null>(null);

  const handleEdit = async (data: FormValues) => {
    if (!editId) return;
    SetEditLoading(true);

    try {
      await api.put(`/api/course/${editId}`, data);

      setCourse((prev) =>
        prev.map((prev) => (prev.id === editId ? { ...prev, ...data } : prev)),
      );

      toast.success("Course updated");
      setEditId(null);
      SetEditLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Update failed";
      toast.error(message);
      SetEditLoading(false);
    }
  };

  const fetchCourse = async () => {
    SetLoading(true);
    try {
      const res = await api.get("/api/courses-admin");
      setCourse(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      SetLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleDelete = async (id: number) => {
    SetLoading(true);
    try {
      await api.delete(`/api/course/${id}`);
      setCourse((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course berhasil dihapus");
      SetLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Delete failed";
      toast.error(message);
      SetLoading(false);
    }
  };

  const handlePublished = async (id: number) => {
    setPubLoading(id);
    try {
      await api.put(`/api/course/${id}`, {
        is_published: true,
      });

      setCourse((prev) =>
        prev.map((course) =>
          course.id === id ? { ...course, is_published: true } : course,
        ),
      );

      toast.success("Course Published");
      setPubLoading(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err.message ?? "Published failed";
      toast.error(message);
      setPubLoading(null);
    }
  };

  return (
    <div className="container px-10 mx-auto">
      <div className="space-y-5">
        <CourseAdd onSuccess={fetchCourse} />
        <div className="grid grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-4 flex items-center justify-center h-64">
              <Spinner className="size-8" />
            </div>
          ) : (
            courses.map((course) => (
              <Card key={course.id} className="relative w-full h-50 max-w-sm">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="text-justify line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex gap-2 mt-auto">
                  <Button
                    className="flex-1 rounded-xl"
                    disabled={course.is_published || isPubLoading === course.id}
                    onClick={() => handlePublished(course.id)}
                  >
                    {isPubLoading === course.id ? (
                      <Spinner />
                    ) : course.is_published ? (
                      "Published"
                    ) : (
                      "Publish"
                    )}
                  </Button>
                  <Button className="flex-1 rounded-xl" variant="outline">
                    <Link href={`/dashboard/${course.id}`}>View</Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Action</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="cursor-pointer"
                            variant="destructive"
                          >
                            {isLoading ? (
                              <Spinner />
                            ) : (
                              <Trash2Icon className="text-destructive" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this course.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(course.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setEditId(course.id);
                              form.setValue("title", course.title);
                              form.setValue("description", course.description);
                            }}
                            className="cursor-pointer"
                          >
                            <PencilIcon className="size-4" />
                            Edit
                          </DropdownMenuItem>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Course</DialogTitle>
                            <DialogDescription>
                              Update course information.
                            </DialogDescription>
                          </DialogHeader>

                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleEdit)}>
                              <div className="space-y-4">
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
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <Button type="submit" className="w-full">
                                  {isEditLoading ? <Spinner /> : ""}
                                  Save Changes
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
