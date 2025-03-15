FROM oven/bun:latest AS base
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN bun install --no-optional
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
