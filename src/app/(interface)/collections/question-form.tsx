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
  allPlayers,
  colors,
  textAreaRef,
  ...props
}: ComponentProps<typeof RichTextarea> & {
  parsedText: ReturnType<typeof parseQuestion>;
  allPlayers: number[];
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
        return parsedText.parts.map((playerIdx, idx) => {
          // In this case it's just a part of the question
          if (typeof playerIdx === "string") return playerIdx;

          const player = parsedText.players[playerIdx - 1]!;
          const colorIdx = allPlayers.indexOf(player);

          return (
            <span
              key={idx}
              style={{
                backgroundColor: colors[colorIdx],
              }}
            >
              ${player}
            </span>
          );
        });
      }}
    </RichTextarea>
  );
}

function PlayerReferenceButtons({
  players,
  addUser,
}: {
  players: number[];
  addUser: (playerId?: number) => void;
}) {
  return (
    <div className="!mb-2 flex w-full max-w-full flex-row">
      <Button
        variant="secondary"
        type="button"
        onClick={() => addUser()}
        className={cn([
          {
            "rounded-r-none": players.length > 0,
          },
        ])}
      >
        <FaPlus />
      </Button>
      {players.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="secondary"
              type="button"
              className="fadeIn rounded-l-none duration-300"
            >
              Reference Player <FaAngleDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {players.map((player) => (
              <DropdownMenuItem key={player} onClick={() => addUser(player)}>
                {player}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
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

  const playersSet = new Set<number>(
    parsedQuestion.players.concat(parsedChallengeEnd?.players ?? []),
  );

  const allPlayers = Array.from(playersSet.values()).sort((a, b) => a - b);

  const colors = useMemo(
    () => generateColors(allPlayers.length),
    [allPlayers.length],
  );

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
                players={allPlayers}
                addUser={(playerNo) => {
                  const prevText = fieldValue.question;

                  if (!playerNo) {
                    const lastPlayer = allPlayers.at(-1);
                    playerNo = lastPlayer ? lastPlayer + 1 : 1;
                  }

                  const newText = prevText
                    ? `${prevText} $${playerNo} `
                    : `$${playerNo} `;

                  form.setValue(`cards.${idx}.question`, newText);
                  questionTextRef.current?.focus();
                }}
              />

              <FormControl>
                <Textarea
                  placeholder=""
                  {...field}
                  allPlayers={allPlayers}
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
                  players={allPlayers}
                  addUser={(playerNo) => {
                    const prevText = field.value;

                    if (!playerNo) {
                      const lastPlayer = allPlayers.at(-1);
                      playerNo = lastPlayer ? lastPlayer + 1 : 1;
                    }

                    const newText = prevText
                      ? `${prevText} $${playerNo} `
                      : `$${playerNo} `;

                    form.setValue(`cards.${idx}.questionEnd`, newText);
                    cahllengeEndTextRef.current?.focus();
                  }}
                />
                <FormControl>
                  <Textarea
                    placeholder=""
                    {...field}
                    allPlayers={allPlayers}
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
