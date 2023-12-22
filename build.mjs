import esbuild from "esbuild";
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

function manifestMetaPlugin(manifest) {
    let res = `/**\n`;
    Object.entries(manifest.meta).forEach(([key, value]) => {
        res += ` * @${key} ${value}\n`;
    });
    res += ` */\n`;
    return {
        name: 'manifest-meta-plugin',
        setup(build) {
            build.onEnd((result) => {
                if (build.initialOptions.write !== false) return;
                const out = result.outputFiles[0];
                writeFile(out.path, res + out.text);
            });
        },
    }
}

const plugins = await readdir('plugins');
plugins.forEach(async (plugin) => {
    const manifest = JSON.parse(await readFile(join('plugins', plugin, 'manifest.json')));
    esbuild.build({
        entryPoints: [join('plugins', plugin, manifest.entrypoint)],
        outfile: `dist/${plugin}.plugin.js`,
        write: false,
        minify: true,
        plugins: [manifestMetaPlugin(manifest)]
    });
});