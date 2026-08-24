/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

/** Returns a Promise that resolves with DOMPurify, loading the script if needed. */
const getDOMPurify = () => {
  if (typeof window.DOMPurify?.sanitize === 'function') {
    return Promise.resolve(window.DOMPurify);
  }
  const base = typeof window.hlx?.codeBasePath === 'string' ? window.hlx.codeBasePath : '';
  return new Promise((resolve, reject) => {
    loadScript(`${base}/scripts/dompurify.min.js`, () => {
      if (typeof window.DOMPurify?.sanitize === 'function') {
        resolve(window.DOMPurify);
      } else {
        reject(new Error('DOMPurify failed to load'));
      }
    });
  });
};

/**
 * Renders a fetched AEM fragment document into a shadow-root container.
 *
 * The fragment's own CSS (<style> / <link rel="stylesheet"> from <head>) is
 * preserved verbatim rather than routed through DOMPurify's CSS sanitizer, which
 * drops an entire stylesheet when it hits modern rules it can't parse (e.g.
 * :has(), some @media blocks). CSS carries no script-execution vector inside a
 * shadow root, so this is safe. :root selectors are remapped to :host so the
 * fragment's custom properties resolve against the shadow root. Only the <body>
 * markup is run through DOMPurify (scripts stripped) for XSS defense-in-depth.
 */
const renderFragment = (DOMPurify, html, container) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const clone = node.cloneNode(true);
    if (clone.tagName === 'STYLE') {
      clone.textContent = clone.textContent.replace(/:root\b/g, ':host, :root');
    }
    container.appendChild(clone);
  });
  const cleanBody = DOMPurify.sanitize(doc.body.innerHTML, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script'],
  });
  container.insertAdjacentHTML('beforeend', cleanBody);
};

/**
 * Web component that fetches a full HTML document from an AEM Fragment URL and
 * renders it in a shadow root, preserving the document's CSS. Fetched content is
 * sanitized with DOMPurify before insertion (scripts stripped, defense-in-depth).
 */
class AemFragmentEmbed extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  }

  connectedCallback() {
    const src = this.getAttribute('src');
    if (!src) return;
    this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.className = 'aem-fragment-container';
    this.shadowRoot.appendChild(container);
    getDOMPurify()
      .then((DOMPurify) => fetch(src)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })
        .then((html) => renderFragment(DOMPurify, html, container)))
      .catch(() => {
        container.textContent = 'Failed to load fragment';
      });
  }
}

if (!customElements.get('aem-fragment-embed')) {
  customElements.define('aem-fragment-embed', AemFragmentEmbed);
}

const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
      scrolling="no" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;

const embedAemFragment = (url) => `<aem-fragment-embed src="${url.href}"></aem-fragment-embed>`;

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedTwitter = (url) => {
  if (!url.href.startsWith('https://twitter.com')) {
    url.href = url.href.replace('https://x.com', 'https://twitter.com');
  }
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

const loadEmbed = (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['vimeo'],
      embed: embedVimeo,
    },
    {
      match: ['twitter', 'x.com'],
      embed: embedTwitter,
    },
    {
      match: ['/adobe/contentFragments/'],
      embed: embedAemFragment,
      className: 'embed-aem-fragment',
    },
  ];
  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  if (config) {
    block.innerHTML = config.embed(url, autoplay);
    const embedClass = config.className || `embed-${config.match[0]}`;
    block.classList = `block embed ${embedClass}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const link = block.querySelector('a').href;
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    wrapper.innerHTML = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.prepend(placeholder);
    wrapper.addEventListener('click', () => {
      loadEmbed(block, link, true);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }
}
