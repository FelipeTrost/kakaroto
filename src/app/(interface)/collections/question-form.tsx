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
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MdDelete, MdInfo } from "react-icons/md";
import { FaAngleDown, FaPlus } from "react-icons/fa";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function QuestionForm({
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
      <AccordionTrigger
        className="relative"
        rightNode={
          <Button
            variant="outline"
            onClick={() => fieldArray.remove(idx)}
            disabled={fieldArray.fields.length === 1}
            className="ml-4"
          >
            <MdDelete />
          </Button>
        }
      >
        <div className="flex flex-grow items-center justify-between gap-4 overflow-hidden pr-4">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            Question {idx + 1}
          </span>

          {form.formState.errors.cards?.[idx] && (
            <MdInfo className="absolute right-[-.25rem] top-[-.25rem] z-50 fill-red-800 text-lg" />
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="w-full max-w-lg overflow-x-hidden px-2">
        <FormField
          control={form.control}
          name={`cards.${idx}.type`}
          render={({ field }) => (
            <FormItem className="mb-8 flex items-center gap-4 space-x-2">
              <Switch
                checked={field.value === "ongoing"}
                onCheckedChange={(checked) =>
                  field.onChange(checked ? "ongoing" : "normal")
                }
              />
              <FormLabel className="!m-0">Ongoing challenge</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`cards.${idx}.question`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge</FormLabel>

              <div className="!mb-2 flex w-full max-w-full flex-row">
                <Button
                  variant="secondary"
                  onClick={() => addUser()}
                  className={cn([
                    {
                      "rounded-r-none": parsedQuestion.nPlayers > 0,
                    },
                  ])}
                >
                  <FaPlus />
                </Button>

                {parsedQuestion.nPlayers > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="secondary"
                        disabled={parsedQuestion.nPlayers === 0}
                        className="fadeIn rounded-l-none duration-300"
                      >
                        Reference Player <FaAngleDown className="ml-2" />
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
                )}
              </div>

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
            <h2 className="mt-2">Question preview:</h2>
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
