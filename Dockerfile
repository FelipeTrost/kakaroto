FROM oven/bun:1 AS base
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
