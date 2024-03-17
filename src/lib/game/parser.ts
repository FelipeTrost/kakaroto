export type ParsedQuestion =
  {
    /** Strings represent a part of the question and numbers represent different players */
    parts: (string | number)[]
    /** The number that were used to reference players sorted */
    players: number[]
    nPlayers: number
  }

export function parseQuestion(input: string) {
  const playerMatches = input.matchAll(/\$\d+/g)

  const players = new Set<number>();

  for (const player of playerMatches) {
    const playerNo = Number.parseInt(player[0].substring(1))
    players.add(playerNo)
  }

  const sortedPlayers = [...players.values()].sort()

  const parts: (string | number)[] = []
  let lastIdx = 0;

  for (const player of input.matchAll(/\$\d+/g)) {
    const idx = player.index ?? 0
    if (idx > 0) parts.push(input.substring(lastIdx, idx))
    lastIdx = idx + player[0].length

    const playerNo = Number.parseInt(player[0].substring(1))
    parts.push(sortedPlayers.indexOf(playerNo) + 1)
  }
  parts.push(input.substring(lastIdx,))

  return { parts, nPlayers: sortedPlayers.length, players: sortedPlayers } as ParsedQuestion
}
