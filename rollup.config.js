import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/index.ts",
    output: [
        {
            name: "glectronui",
            format: "umd",
            file: "dist/bundle.js"
        },
        {
            name: "glectronui",
            format: "umd",
            file: "dist/bundle.min.js",
            plugins: [terser()]
        }
    ],
    plugins: [typescript(), babel({ babelHelpers: "bundled", extensions: [".js", ".ts"] })]
}