import { loadCSS } from '../../scripts/aem.js';

/**
 * Parses a widget href into its folder path and name.
 * @param {string} pathname URL pathname (for example, `/widgets/path/name.html`)
 * @returns {{ widgetPath: string, widgetName: string }}
 */
function parseWidgetHref(pathname) {
  const pathSegments = pathname.split('/').filter((part) => part);
  const widgetName = pathSegments[pathSegments.length - 1].split('.')[0];
  const widgetPath = pathSegments.slice(1, -1).join('/');
  return { widgetPath, widgetName };
}

/**
 * Builds a widget asset URL.
 * @param {string} widgetPath Folder path under `/widgets/`
 * @param {string} widgetName Widget file name without extension
 * @param {string} extension File extension (`html`, `css`, or `js`)
 * @returns {string} Widget asset URL
 */
function widgetUrl(widgetPath, widgetName, extension) {
  const prefix = widgetPath ? `${widgetPath}/` : '';
  return `${window.hlx.codeBasePath}/widgets/${prefix}${widgetName}.${extension}`;
}

/**
 * Applies widget classes and authored query metadata before loading widget content.
 * @param {Element} widget Widget block element
 * @param {HTMLAnchorElement} source Authored widget link
 * @param {string} widgetName Widget name
 * @param {URLSearchParams} searchParams Query parameters from the widget link
 */
function applyWidgetShell(widget, source, widgetName, searchParams) {
  widget.classList.add(widgetName);
  widget.classList.remove('block');
  widget.dataset.source = source.href;
  searchParams.forEach((value, key) => {
    widget.dataset[key] = value;
  });

  const wrapper = widget.closest('.widget-wrapper');
  if (wrapper) {
    wrapper.classList.add(`${widgetName}-wrapper`);
    wrapper.classList.remove('widget-wrapper');
  }
  const container = widget.closest('.widget-container');
  if (container) {
    container.classList.add(`${widgetName}-container`);
    container.classList.remove('widget-container');
  }
}

/**
 * Loads and decorates a widget block.
 * @param {Element} widget Widget block element
 */
export default async function decorate(widget) {
  const source = widget.querySelector('a[href]');
  if (!source) return;

  const { pathname, searchParams } = new URL(source.href);
  const { widgetPath, widgetName } = parseWidgetHref(pathname);
  if (!widgetName || !pathname.includes('/widgets/')) return;

  try {
    applyWidgetShell(widget, source, widgetName, searchParams);

    const response = await fetch(widgetUrl(widgetPath, widgetName, 'html'));
    if (!response.ok) throw new Error(`Widget HTML request failed (${response.status})`);
    widget.innerHTML = await response.text();

    const cssLoaded = loadCSS(widgetUrl(widgetPath, widgetName, 'css'));
    const decorationComplete = (async () => {
      const mod = await import(widgetUrl(widgetPath, widgetName, 'js'));
      if (mod.default) await mod.default(widget);
    })();
    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`failed to load widget ${widgetPath}/${widgetName}`, error);
  }
}
