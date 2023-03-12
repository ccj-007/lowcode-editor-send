import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import postcss from "rollup-plugin-postcss"
import jsx from "acorn-jsx"
import json from "@rollup/plugin-json"
import cleanup from "rollup-plugin-cleanup"
import clear from "rollup-plugin-clear"

const config = {
    input: "src/customComponents/renderer.ts",
    output: {
        dir: "comp-sdk",
        format: "es",
        globals: {
            react: "React",
        },
        plugins: [
            getBabelOutputPlugin({
                presets: ["@babel/preset-react"],
            }),
        ],
    },
    acornInjectPlugins: [jsx()],
    plugins: [
        clear({
            targets: ["./comp-sdk/"],
        }),
        resolve(),
        commonjs(),
        babel({
            presets: [
                [
                    "@babel/preset-react",
                    {
                        development: false,
                    },
                ],
            ],
            babelHelpers: "bundled",
        }),
        typescript({
            jsx: "preserve",
        }),
        json(),
        postcss(),
        terser(),
        cleanup(),
    ],
}

export default config
