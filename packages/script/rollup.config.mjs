import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import swc from "@rollup/plugin-swc";
import alias from "@rollup/plugin-alias";
import { terser } from "rollup-plugin-terser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: "src/index.ts",

  output: [
    {
      file: "dist/v1.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/v1.min.js",
      format: "iife",
      name: "osstag",
      plugins: [terser()],
      sourcemap: false,
    },
  ],

  plugins: [
    alias({
      entries: [
        {
          find: "@otm/types",
          replacement: path.resolve(__dirname, "../types/src"),
        },
      ],
    }),

    resolve({
      extensions: [".js", ".ts"],
    }),

    commonjs(),

    swc({
      jsc: {
        parser: {
          syntax: "typescript",
        },
        target: "es2020",
      },
    }),
  ],
};
