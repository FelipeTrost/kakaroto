const defaultPalette = [
  "#ffadadff",
  "#ffd6a5ff",
  "#caffbfff",
  "#9bf6ffff",
  "#a0c4ffff",
  "#bdb2ffff",
  "#ffc6ffff",
];

/** please don't do in place ops with the returned array (this is a note for myself) */
export function generateColors(n: number, saturation = 100, lightness = 50) {
  if (n <= defaultPalette.length) return defaultPalette;

  const colors = [];

  const step = 360 / n;
  for (let i = 0; i < n; i++)
    colors.push(`hsl(${Math.round(step * i)}, ${saturation}%, ${lightness}%)`);

  return colors;
}
