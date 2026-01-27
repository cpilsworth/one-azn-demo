/**
 * Workfront Utility - Adobe Spectrum 2 Interface
 * 
 * This module initializes the Workfront task management utility
 * with Adobe Spectrum 2 web components for a modern UI experience.
 * 
 * Features:
 * - OAuth2 PKCE authentication flow
 * - Task list with status badges (Complete, In Progress, Pending)
 * - Filter by current page (using document.referrer)
 * - Automatic token refresh
 * - Responsive Spectrum 2 design
 */

function init() {
  console.log('Workfront Utility initialized with Adobe Spectrum 2');
  
  try {
    const keys = Object.keys(window.localStorage || {});
    console.log(`[Workfront] localStorage keys: ${keys.length}`);
    
    // Log storage keys (but not sensitive values)
    keys.forEach((key) => {
      const value = window.localStorage.getItem(key);
      const isSensitive = /token|secret|password|session/i.test(key);
      const printable = isSensitive
        ? '[REDACTED]'
        : (value && value.length > 300 ? `${value.slice(0, 300)}…(truncated)` : value);
      console.log(`[Workfront] ${key} =`, printable);
    });

    // Log referrer for debugging filter functionality
    if (document.referrer) {
      console.log(`[Workfront] document.referrer = ${document.referrer}`);
    }

    // Check if Spectrum Web Components are loaded
    if (customElements.get('sp-theme')) {
      console.log('[Workfront] Adobe Spectrum 2 Web Components loaded successfully');
    } else {
      console.warn('[Workfront] Waiting for Adobe Spectrum 2 Web Components to load...');
    }
  } catch (e) {
    console.warn('[Workfront] Unable to read localStorage or check components', e);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}