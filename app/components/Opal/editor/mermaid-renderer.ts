/**
 * Lazy loader + render helper for Mermaid diagrams.
 *
 * The mermaid runtime is ~600 KB gzipped, so we defer it via dynamic
 * import. The first call to loadMermaid() kicks off the import; the
 * resolved module is cached on a module-level promise so every Mermaid
 * code block in the document shares one runtime.
 *
 * Theming is global to the runtime (mermaid.initialize is process-wide),
 * so setMermaidTheme re-initializes and bumps a generation counter that
 * node views can use to detect "I need to re-render under the new theme".
 */

export type MermaidTheme = 'default' | 'dark';

// Resolve a CSS custom property to a hex string by letting the browser
// compute it — handles light-dark() and other CSS functions that mermaid
// can't parse directly.
function resolveColor(cssVarName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;visibility:hidden;background:var(${cssVarName})`;
  document.body.appendChild(el);
  const rgb = getComputedStyle(el).backgroundColor;
  document.body.removeChild(el);
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return fallback;
  return '#' + m.slice(0, 3).map((n) => parseInt(n).toString(16).padStart(2, '0')).join('');
}

function buildAxiomThemeVars() {
  return {
    primaryColor:        resolveColor('--ax-colors-bg-accent-subtle',  '#EEF2FF'),
    primaryBorderColor:  resolveColor('--ax-colors-border-accent',     '#6066F2'),
    primaryTextColor:    resolveColor('--ax-colors-fg-default',        '#2E3442'),
    secondaryColor:      resolveColor('--ax-colors-bg-secondary',      '#F5F6FA'),
    tertiaryColor:       resolveColor('--ax-colors-bg-secondary',      '#F5F6FA'),
    lineColor:           resolveColor('--ax-colors-fg-secondary',      '#4F576E'),
    edgeLabelBackground: resolveColor('--ax-colors-bg-default',        '#FFFFFF'),
    background:          resolveColor('--ax-colors-bg-default',        '#FFFFFF'),
    mainBkg:             resolveColor('--ax-colors-bg-accent-subtle',  '#EEF2FF'),
    nodeBorder:          resolveColor('--ax-colors-border-accent',     '#6066F2'),
    clusterBkg:          resolveColor('--ax-colors-bg-secondary',      '#F5F6FA'),
    clusterBorder:       resolveColor('--ax-colors-border-secondary',  '#DADFEB'),
    titleColor:          resolveColor('--ax-colors-fg-default',        '#2E3442'),
    fontSize:            '13px',
  };
}

type MermaidApi = {
  initialize(config: Record<string, unknown>): void;
  render(id: string, code: string): Promise<{ svg: string; bindFunctions?: (el: Element) => void }>;
};

let _modulePromise: Promise<MermaidApi> | null = null;
let _currentTheme: MermaidTheme = 'default';
let _themeGeneration = 0;
let _idSeq = 0;

/**
 * Resolve (and cache) the mermaid runtime. Calls after the first share
 * the same promise — even if the first call hasn't resolved yet.
 */
export function loadMermaid(): Promise<MermaidApi> {
  if (!_modulePromise) {
    _modulePromise = import('mermaid').then((mod) => {
      const api = (mod.default ?? mod) as MermaidApi;
      api.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: buildAxiomThemeVars(),
        securityLevel: 'strict',
        fontFamily: 'inherit',
        flowchart: { curve: 'basis', useMaxWidth: true },
      });
      return api;
    });
  }
  return _modulePromise;
}

/**
 * Apply a new theme. Re-initializes the runtime if it's already loaded;
 * otherwise just stashes the theme so loadMermaid picks it up. Returns
 * the new generation counter — node views can compare against the value
 * they last rendered under to decide whether to re-run render().
 */
export function setMermaidTheme(theme: MermaidTheme): number {
  if (theme === _currentTheme) return _themeGeneration;
  _currentTheme = theme;
  _themeGeneration += 1;
  if (_modulePromise) {
    _modulePromise.then((api) => {
      api.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: buildAxiomThemeVars(),
        securityLevel: 'strict',
        fontFamily: 'inherit',
        flowchart: { curve: 'basis', useMaxWidth: true },
      });
    });
  }
  return _themeGeneration;
}

export function getMermaidTheme(): MermaidTheme {
  return _currentTheme;
}

export function getThemeGeneration(): number {
  return _themeGeneration;
}

export interface RenderResult {
  ok: true;
  svg: SVGElement;
}
export interface RenderError {
  ok: false;
  message: string;
}
export type RenderOutcome = RenderResult | RenderError;

/**
 * Render a mermaid code string to an SVG element. Returns either the
 * SVG (success) or a structured error (so callers can show the message
 * inline rather than throwing).
 *
 * Uses a fresh, off-DOM container per call — mermaid.render mutates the
 * document with a temp node, which we don't want bleeding into the page.
 */
export async function renderMermaid(code: string): Promise<RenderOutcome> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { ok: false, message: 'Empty diagram source' };
  }
  let api: MermaidApi;
  try {
    api = await loadMermaid();
  } catch (err) {
    return { ok: false, message: `Failed to load mermaid: ${stringifyError(err)}` };
  }
  _idSeq += 1;
  const id = `me-mermaid-${_idSeq}`;
  try {
    const { svg } = await api.render(id, trimmed);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = svg;
    const svgEl = wrapper.querySelector('svg');
    if (!svgEl) {
      return { ok: false, message: 'Mermaid produced no SVG output' };
    }
    // Inject rounded corners for node rects via SVG CSS
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = '.node rect, .node polygon { rx: 8; ry: 8; }';
    svgEl.insertBefore(styleEl, svgEl.firstChild);
    return { ok: true, svg: svgEl as SVGElement };
  } catch (err) {
    // mermaid.render appends a stray temp node on parse error; clean it up.
    const stray = document.getElementById(id);
    if (stray) stray.remove();
    return { ok: false, message: stringifyError(err) };
  }
}

function stringifyError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/** Test-only helper to reset module state between cases. */
export function __resetMermaidLoaderForTests(): void {
  _modulePromise = null;
  _currentTheme = 'default';
  _themeGeneration = 0;
  _idSeq = 0;
}
