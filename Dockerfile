FROM oven/bun:1.3.12 AS builder

WORKDIR /app/

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "dist/index.js"]
