"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { type z } from "zod";
import { MdInfo } from "react-icons/md";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createCollectionSchema,
  type CreateCollectionSchema,
} from "@/server/db/zod-schemas";
import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";
import QuestionForm from "./question-form";
import { cn } from "@/lib/utils";
import { Accordion } from "@/components/ui/accordion";
import { type UserResponse } from "@/server/user-response";
import { persistFormStateStore } from "@/lib/persistent-form-state-store";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CollectionForm({
  defaultValues,
  onSubmit,
  update,
}: {
  onSubmit: (
    values: CreateCollectionSchema,
    id: number,
  ) => Promise<UserResponse>;
  defaultValues?: CreateCollectionSchema;
  update?: boolean;
}) {
  const [submitting, startSubmitTransition] = useTransition();
  const params = useParams<{ collectionId: string }>();
  const id = Number(decodeURIComponent(params.collectionId)) || -1;

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CreateCollectionSchema>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: defaultValues ?? {
      cards: [{ question: "", type: "normal" }],
    },
  });

  const errors = form.formState.errors;
  const infoError = errors.title ?? errors.description;
  const questionsError = errors.cards;

  const fieldArray = useFieldArray({
    control: form.control,
    name: "cards",
  });

  const previousValues = persistFormStateStore((state) => state.hasState(id));
  const [previousValuesAcknowledged, setPreviousValuesAcknowledged] =
    useState(false);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setPreviousValuesAcknowledged(true);
      persistFormStateStore
        .getState()
        .setState(value as CreateCollectionSchema, id);
    });

    return () => subscription.unsubscribe();
  }, [form, update, id]);

  const [accordionIdx, setAccordionIdx] = useState("0");

  function onSubmitHandler(values: z.infer<typeof createCollectionSchema>) {
    startSubmitTransition(async () => {
      const response = await onSubmit(values, id);

      if (response.type === "error")
        toast({
          description: "Something went wrong",
          title: "Error",
        });
      else if (response.type === "success") {
        if (!update) persistFormStateStore.getState().resetState();

        toast({
          description: update ? "Collection updated" : "Collection created",
          title: "Success",
        });
        router.refresh();
        router.push("/collections");
      }
    });
  }

  return (
    <>
      <Form {...form}>
        <div className="m-auto max-w-[30rem] pb-4">
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-4"
          >
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info" className="relative">
                  Info
                  {infoError && (
                    <MdInfo className="absolute right-[-.25rem] top-[-.25rem] z-50 fill-red-800 text-lg" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="questions" className="relative">
                  Challenges
                  {questionsError && (
                    <MdInfo className="absolute right-[-.25rem] top-[-.25rem] z-50 fill-red-800 text-lg" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {update ? "Update Collection" : "Create Card Collection"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Collection title" {...field} />
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
                            {/**@ts-expect-error for some reason the field being nullable is not supported*/}
                            <Textarea
                              placeholder="Collection description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="questions">
                <Card>
                  <CardHeader>
                    <CardTitle> Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <Accordion
                      type="single"
                      defaultValue="0"
                      collapsible
                      value={accordionIdx}
                      onValueChange={setAccordionIdx}
                    >
                      {fieldArray.fields.map((item, index) => (
                        <QuestionForm
                          form={form}
                          idx={index}
                          fieldArray={fieldArray}
                          key={item.id}
                        />
                      ))}
                    </Accordion>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        fieldArray.append({ question: "", type: "normal" });
                        setAccordionIdx(fieldArray.fields.length.toString());
                      }}
                    >
                      Add Question
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            <Button
              type="submit"
              disabled={submitting}
              className={cn({
                "animate-bounce": submitting,
              })}
            >
              {update ? "Update Collection" : "Create Collection"}
            </Button>
          </form>
        </div>
      </Form>

      <Dialog
        open={previousValues && !previousValuesAcknowledged}
        onOpenChange={(open) => {
          setPreviousValuesAcknowledged(!open);
          persistFormStateStore.getState().resetState(id);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pick up where you left off?</DialogTitle>
            <DialogDescription>
              You have unsaved form data from a previous session. Would you like
              to continue where you left off?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className={buttonVariants({ variant: "outline" })}>
              Discard changes
            </DialogClose>
            <DialogClose
              className={buttonVariants({ variant: "default" })}
              onClick={() =>
                form.reset(persistFormStateStore.getState().state[id])
              }
            >
              Continue editing
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
