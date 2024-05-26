import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { parseQuestion } from "@/lib/game/parser";
import { type createCollectionSchema } from "@/server/db/zod-schemas";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { type UseFieldArrayReturn, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MdDelete, MdInfo } from "react-icons/md";

export default function QuestionDialog({
  form,
  idx,
  fieldArray,
}: {
  form: UseFormReturn<z.infer<typeof createCollectionSchema>>;
  idx: number;
  fieldArray: UseFieldArrayReturn<
    z.infer<typeof createCollectionSchema>,
    "cards"
  >;
}) {
  const fieldValue = form.watch(`cards.${idx}`);

  const parsedQuestion = parseQuestion(fieldValue?.question ?? "");

  function addUser(playerNo?: number) {
    if (!playerNo || !parsedQuestion.players.includes(playerNo))
      playerNo = parsedQuestion.players.at(-1)
        ? parsedQuestion.players.at(-1)! + 1
        : 1;

    form.setValue(
      `cards.${idx}.question`,
      (fieldValue?.question ?? "") + "$" + playerNo,
    );

    form.setFocus(`cards.${idx}.question`);
  }

  return (
    <AccordionItem value={idx.toString()}>
      <AccordionTrigger className="relative flex-grow">
        <>
          {fieldValue?.question.length ?? 0 > 0
            ? parsedQuestion.parts.map((part, idx) => {
                if (typeof part === "string") return part;
                return (
                  <Badge key={idx} variant="secondary">
                    Player {part}
                  </Badge>
                );
              })
            : "... something fun"}

          {form.formState.errors.cards?.[idx] && (
            <MdInfo className="absolute right-[-.25rem] top-[-.25rem] z-50 fill-red-800 text-lg" />
          )}

          <Button
            variant="outline"
            onClick={() => fieldArray.remove(idx)}
            disabled={fieldArray.fields.length === 1}
          >
            <MdDelete />
          </Button>
        </>
      </AccordionTrigger>

      <AccordionContent className="w-full max-w-lg overflow-x-hidden p-1">
        <FormField
          control={form.control}
          name={`cards.${idx}.type`}
          render={({ field }) => (
            <FormItem className=" max-w-40">
              <FormLabel>Question type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="m-auto my-2 w-[95%] border-[0.5px] border-gray-500" />

        <div className="flex w-full max-w-full flex-row gap-4">
          <Button variant="secondary" onClick={() => addUser()}>
            Add Player
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger disabled={parsedQuestion.nPlayers === 0}>
              <Button
                variant="secondary"
                disabled={parsedQuestion.nPlayers === 0}
              >
                Reference Player
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {parsedQuestion.players.map((n, idx) => (
                <DropdownMenuItem key={n} onClick={() => addUser(n)}>
                  {idx + 1}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <FormField
          control={form.control}
          name={`cards.${idx}.question`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Everybody has to drink"
                  className="border-x"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {parsedQuestion.nPlayers > 0 && (
          <>
            <h2>Question preview:</h2>
            <div className="min-h-[4ch] w-full rounded-md border px-3 py-2 text-base ring-ring ring-offset-2 ring-offset-background">
              {parsedQuestion.parts.map((part, idx) => {
                if (typeof part === "string") return part;
                return <Badge key={idx}>Player {part}</Badge>;
              })}
            </div>
          </>
        )}

        {fieldValue?.type === "ongoing" && (
          <>
            <div className="m-auto my-2 w-[95%] border-[0.5px] border-gray-500" />
            <FormField
              control={form.control}
              name={`cards.${idx}.questionEnd`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question End</FormLabel>
                  <FormControl>
                    <Textarea placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
