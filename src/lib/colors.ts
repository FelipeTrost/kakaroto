export function generateColors(n: number, saturation = 100, lightness = 50) {
  const colors = [];

  const step = 360 / n;
  for (let i = 0; i < n; i++)
    colors.push(`hsl(${Math.round(step * i)}, ${saturation}%, ${lightness}%)`);

  return colors;
}
