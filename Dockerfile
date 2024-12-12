FROM oven/bun:latest AS builder

WORKDIR /app/

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "dist/index.js"]
