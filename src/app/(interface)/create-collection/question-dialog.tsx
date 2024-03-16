import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormControl, FormMessage } from "@/components/ui/form";
import { Input, defaultInputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCollectionSchema } from "@/server/db/zod-schemas";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";

export default function QuestionDialog({
  field,
  form,
  idx,
}: {
  field: ControllerRenderProps<
    z.infer<typeof createCollectionSchema>,
    `cards.${number}.question`
  >;
  form: UseFormReturn<z.infer<typeof createCollectionSchema>>;
  idx: number;
}) {
  const fieldValue = form.getValues("cards")[idx];

  return (
    <Dialog>
      <DialogTrigger asChild className="flex-grow">
        <Button variant="outline">
          {fieldValue?.question && fieldValue.question.length > 0
            ? fieldValue?.question
            : "Enter something"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Question</DialogTitle>
          <DialogDescription>Makeup a fun question</DialogDescription>
        </DialogHeader>

        <FormControl>
          <div
            {...field}
            onInput={(e) => {
              field.onChange(e.currentTarget.textContent);
            }}
            className={defaultInputClasses}
            contentEditable={true}
            dangerouslySetInnerHTML={{ __html: fieldValue?.question ?? "" }}
          ></div>
        </FormControl>

        <FormMessage />
        <DialogFooter>
          <Button
            onClick={() => {
              form.setValue(
                `cards.${idx}.question`,
                (fieldValue?.question ?? "") +
                  '<span style="color:red">Hoaaa</span>',
              );
            }}
          >
            Add Player
          </Button>

          <DialogClose asChild>
            <Button type="button">Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
