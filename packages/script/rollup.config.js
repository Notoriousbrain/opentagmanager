import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

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
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
};
