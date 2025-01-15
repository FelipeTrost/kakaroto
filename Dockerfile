FROM oven/bun:latest AS base
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN apt update && apt install python3 python3-pip make g++ -y # workaround for python dep issue
RUN bun install
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
