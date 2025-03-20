import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { textAreaStyles } from "@/components/ui/textarea";
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
import { RichTextarea, RichTextareaHandle } from "rich-textarea";
import { generateColors } from "@/lib/colors";
import { type ComponentProps, forwardRef, useMemo, useRef } from "react";

function Textarea({
  parsedText,
  colors,
  textAreaRef,
  ...props
}: ComponentProps<typeof RichTextarea> & {
  parsedText: ReturnType<typeof parseQuestion>;
  colors: string[];
  textAreaRef?: React.Ref<RichTextareaHandle>;
}) {
  return (
    <RichTextarea
      placeholder="Everybody has to drink"
      className={textAreaStyles}
      style={{ width: "100%" }}
      ref={textAreaRef}
      {...props}
    >
      {() => {
        return parsedText.parts.map((part, idx) => {
          if (typeof part === "string") return part;
          return (
            <span
              key={idx}
              style={{
                backgroundColor: colors[part - 1],
              }}
            >
              ${parsedText.players[part - 1]}
            </span>
          );
        });
      }}
    </RichTextarea>
  );
}

function PlayerReferenceButtons({
  parsedText,
  addUser
}:
  {
    addUser: (playerId?: number) => void
    parsedText: ReturnType<typeof parseQuestion>;
  }) {
  return <div className="!mb-2 flex w-full max-w-full flex-row">
    <Button
      variant="secondary"
      type="button"
      onClick={() =>
        addUser()
      }
      className={cn([
        {
          "rounded-r-none": parsedText.nPlayers > 0,
        },
      ])}
    >
      <FaPlus />
    </Button>

    {parsedText.nPlayers > 0 && (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="secondary"
            type="button"
            disabled={parsedText.nPlayers === 0}
            className="fadeIn rounded-l-none duration-300"
          >
            Reference Player <FaAngleDown className="ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {parsedText.players.map((n, idx) => (
            <DropdownMenuItem
              key={n}
              onClick={() => addUser(n)}
            >
              {idx + 1}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
    }
  </div >
}

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
  const parsedChallengeEnd =
    fieldValue.type === "ongoing"
      ? parseQuestion(fieldValue.questionEnd || "")
      : undefined;

  const totalPlayes = Math.max(
    parsedQuestion.nPlayers,
    parsedChallengeEnd?.nPlayers ?? 0,
  );
  const colors = useMemo(
    () => generateColors(totalPlayes, 100, 80),
    [totalPlayes],
  );

  function addUserToText(text: string | undefined, parsedText: ReturnType<typeof parseQuestion>, playerNo?: number) {
    if (!playerNo || !parsedText.players.includes(playerNo)) {
      const lastPlayer = parsedText.players.at(-1);
      playerNo = lastPlayer ? lastPlayer + 1 : 1;
    }

    return `${text ?? ""} $${playerNo} `
  }

  const questionTextRef = useRef<RichTextareaHandle | null>(null);
  const cahllengeEndTextRef = useRef<RichTextareaHandle | null>(null);

  return (
    <AccordionItem value={idx.toString()}>
      <AccordionTrigger
        className="relative"
        rightNode={
          <Button
            variant="outline"
            type="button"
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
            Challenge {idx + 1}
          </span>

          {form.formState.errors.cards?.[idx] && (
            <MdInfo className="absolute right-[-.5rem] top-[.3rem] z-50 fill-red-800 text-lg" />
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
            <FormItem className="mb-8">
              <FormLabel>Challenge</FormLabel>

              <PlayerReferenceButtons
                parsedText={parsedQuestion}
                addUser={(id) => {
                  const newText = addUserToText(fieldValue?.question, parsedQuestion, id);
                  form.setValue(`cards.${idx}.question`, newText);
                  questionTextRef.current?.focus();
                }}
              />

              <FormControl>
                <Textarea
                  placeholder=""
                  {...field}
                  parsedText={parsedQuestion}
                  colors={colors}
                  textAreaRef={questionTextRef}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fieldValue?.type === "ongoing" && (
          <FormField
            control={form.control}
            name={`cards.${idx}.questionEnd`}
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel>Challenge End</FormLabel>
                <PlayerReferenceButtons
                  parsedText={parsedChallengeEnd!}
                  addUser={(id) => {
                    const newText = addUserToText(fieldValue.questionEnd, parsedChallengeEnd!, id);
                    form.setValue(`cards.${idx}.questionEnd`, newText);
                    cahllengeEndTextRef.current?.focus();
                  }}
                />
                <FormControl>
                  <Textarea
                    placeholder=""
                    {...field}
                    parsedText={parsedChallengeEnd!}
                    colors={colors}
                    textAreaRef={cahllengeEndTextRef}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
