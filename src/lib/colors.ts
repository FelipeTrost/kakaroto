const defaultPalette = [
  "#ff4400",
  "#ad0ab7",
  "#ff9000",
  "#0088fd",
  "#00b341",
  "#7034be",
  "#ffbd00",
  "#384fbd",
  "#ff0060",
  "#009985",
  "#ff1222",
  "#79c32d",
];

/** please don't do in place ops with the returned array (this is a note for myself) */
export function generateColors(n: number, saturation = 100, lightness = 40) {
  if (n <= defaultPalette.length) return defaultPalette;

  const colors = [];

  const step = 360 / n;
  for (let i = 0; i < n; i++)
    colors.push(`hsl(${Math.round(step * i)}, ${saturation}%, ${lightness}%)`);

  return colors;
}
