import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import path from "path";

const { LERNA_PACKAGE_NAME } = process.env;
const PACKAGE_ROOT_PATH = process.cwd();
const PKG_JSON = require(path.join(PACKAGE_ROOT_PATH, "package.json"));
const INPUT_FILE = path.join(PACKAGE_ROOT_PATH, `${PKG_JSON.srcFile}/${PKG_JSON.srcName}.tsx`);
const OUTPUT_DIR = path.join(PACKAGE_ROOT_PATH, "dist");
const IS_BROWSER_BUNDLE = !!PKG_JSON.browser;
const formats = IS_BROWSER_BUNDLE ? ["umd"] : ["es", "cjs"];

export default formats.map(format => ({
  plugins: [
    nodeResolve(),
    commonjs({
      include: /node_modules/,
    }),
    babel({
      exclude: ["node_modules/**"],
      presets: [
        [
          '@babel/preset-env', 
          {'modules': false}
        ], 
        '@babel/react'
      ],
      plugins: ["styled-jsx/babel"],
      babelHelpers: 'bundled'
    }),
    typescript({ 
      module: "ESNext"
    })
  ],
  input: INPUT_FILE,
  external: [
    'react',
    'react-dom',
  ],
  output: {
    ...(format === "umd" ? {file: path.join(OUTPUT_DIR, `${PKG_JSON.srcName}.${format}.tsx`)} : {}),
    format,
    sourcemap: true,
    name: LERNA_PACKAGE_NAME,
    amd: {
      id: LERNA_PACKAGE_NAME
    },
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }, 
    ...(format !== "umd" ? {dir: OUTPUT_DIR} : {}),
  },
  ...(format !== "umd" ? {preserveModules: true} : {}),
}));
  