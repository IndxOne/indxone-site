const { watch } = require("node:fs");
const { buildSite } = require("./build");

let timer;
let building = false;
let pending = false;
async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    await buildSite();
  } catch (error) {
    console.error(`Build failed: ${error.message}`);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      rebuild();
    }
  }
}
watch(process.cwd(), { recursive: true }, (_event, filename) => {
  if (!filename || /^(dist|node_modules|\.git|docs)[/\\]/.test(filename)) return;
  if (!/\.(html|css|js|mjs|json)$/.test(filename) && filename !== "_redirects") return;
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
});
