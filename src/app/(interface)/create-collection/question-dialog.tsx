import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { parseQuestion } from "@/lib/game/parser";
import { type createCollectionSchema } from "@/server/db/zod-schemas";
import {
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";
import { type z } from "zod";

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
  const parsedQuestion = parseQuestion(fieldValue?.question ?? '')

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


        <div className="flex flex-row gap-4">
          <Button
            variant="secondary"
            onClick={() => {
              form.setValue(
                `cards.${idx}.question`,
                (fieldValue?.question ?? "") + '$' + ((parsedQuestion.players.at(-1) ? parsedQuestion.players.at(-1)! + 1 : 1))
              );
              form.setFocus(`cards.${idx}.question`,)
            }}
          >
            Add Player
          </Button>
        </div>

        <FormControl>
          <Textarea {...field} />
        </FormControl>

        <FormMessage />

        <h2>Question preview:</h2>
        <div className="w-full rounded-md border px-3 py-2 text-sm ring-offset-background ring-ring ring-offset-2 min-h-[4ch]">
          {
            parsedQuestion.parts.map((part, idx) => {
              if (typeof part === 'string') return part
              return <Badge key={idx}>Player {part}</Badge>
            })
          }

        </div>

        <DialogFooter>

          <DialogClose asChild>
            <Button type="button">Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
