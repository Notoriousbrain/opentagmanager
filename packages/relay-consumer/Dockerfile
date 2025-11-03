FROM --platform=linux/amd64 oven/bun:1.1.23
WORKDIR /app
COPY dist ./dist
CMD ["bun", "run", "dist/index.js"]