// Stand-in for `sharp`, overridden workspace-wide (see root package.json's
// pnpm.overrides). `sharp` is never a direct dependency of any app here —
// it's only pulled in transitively as `next`'s optional dependency for the
// built-in Image Optimization API, which both apps/web and apps/landing
// disable via `images.unoptimized: true`. The real `sharp` package ships a
// native `.node` binary that Next's file tracer still picks up statically
// (even though the code path is dead), and that binary can't be bundled for
// the Cloudflare Workers runtime. Requiring this module is harmless; calling
// it is not something that should ever happen.
module.exports = function sharp() {
  throw new Error(
    "sharp is stubbed out in this workspace (see shims/sharp) and is not available at runtime."
  );
};
