// TODO: refactor this file

export type ParsedQuestion = {
  /** Strings represent a part of the question and numbers represent different players */
  parts: (string | number)[];
  /** The number that were used to reference players sorted */
  players: number[];
  nPlayers: number;
};

export function parseQuestion(input: string) {
  // Sorted players
  const playerMatches = input.matchAll(/\$\d+/g);

  const players = new Set<number>();

  for (const player of playerMatches) {
    const playerNo = Number.parseInt(player[0].substring(1));
    players.add(playerNo);
  }

  const sortedPlayers = [...players.values()];
  sortedPlayers.sort((a, b) => a - b);

  // TODO: move this to another function
  // Split challenge on `$<num>`
  const parts: (string | number)[] = [];
  let lastIdx = 0;

  for (const player of input.matchAll(/\$\d+/g)) {
    const idx = player.index ?? 0;
    if (idx > 0) parts.push(input.substring(lastIdx, idx));
    lastIdx = idx + player[0].length;

    const playerNo = Number.parseInt(player[0].substring(1));
    parts.push(sortedPlayers.indexOf(playerNo) + 1);
  }
  parts.push(input.substring(lastIdx));

  const a = {
    parts,
    nPlayers: sortedPlayers.length,
    players: sortedPlayers,
    playersSet: players,
  };
  console.log("parse", a);
  return a as ParsedQuestion;
}

// returns a list in order to get same number-> player mapping for ongoing challenges
export function displayQuestion(challenges: string[], players: string[]) {
  const displayQuestions = [];

  // Get challenge with most players
  let mostPlayers: number[] = [];
  for (const challenge of challenges) {
    const parsed = parseQuestion(challenge);
    if (parsed.players.length > mostPlayers.length)
      mostPlayers = parsed.players;
  }

  // Compute mapping
  const selectedPlayers = new Map<number, string>();
  const playersLeft = [...players];
  for (const playerN of mostPlayers) {
    const p_idx = Math.floor(playersLeft.length * Math.random());
    const player = playersLeft.splice(p_idx, 1)[0];

    selectedPlayers.set(playerN, player!);
  }

  for (const challenge of challenges) {
    const parsed = parseQuestion(challenge);
    let challengeDisplay = challenge;

    for (const playerN of parsed.players) {
      const player = selectedPlayers.get(playerN);

      challengeDisplay = challengeDisplay.replaceAll(
        "$" + playerN,
        player!,
      );
    }

    displayQuestions.push(challengeDisplay);
  }

  return displayQuestions;
}
