// Strudel Jam bridge - handles postMessage from parent app
(function() {
  let ready = false;
  let pendingCode = null;
  let pendingEval = false;

  function getCMView() {
    const el = document.querySelector('.cm-editor');
    return el && el.cmView && el.cmView.view;
  }

  function setCode(code) {
    const view = getCMView();
    if (view) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
      return true;
    }
    return false;
  }

  function clickPlay() {
    // Click only VISIBLE play buttons (skip the hidden toolbar one)
    const buttons = document.querySelectorAll('button');
    let clicked = false;
    for (const btn of buttons) {
      // Skip buttons inside the hidden #header nav
      if (btn.closest('#header')) continue;
      const text = (btn.textContent || '').trim().toLowerCase();
      if (text === 'play' || text === '▶ play' || text === '▶play') {
        btn.click();
        clicked = true;
      }
    }
    return clicked;
  }

  function triggerEval() {
    if (clickPlay()) return true;
    // Already playing - use Ctrl+Enter to re-evaluate
    const cm = document.querySelector('.cm-content');
    if (cm) {
      cm.focus();
      cm.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', ctrlKey: true, bubbles: true, cancelable: true
      }));
      return true;
    }
    return false;
  }

  // Toolbar is hidden via CSS (off-screen positioning) in the <head>
  function hideToolbar(hide) {
    var header = document.getElementById('header');
    if (header) {
      if (hide) {
        header.style.setProperty('position', 'absolute', 'important');
        header.style.setProperty('top', '-9999px', 'important');
        header.style.setProperty('left', '-9999px', 'important');
        header.style.setProperty('height', '0', 'important');
        header.style.setProperty('overflow', 'hidden', 'important');
      } else {
        header.style.removeProperty('position');
        header.style.removeProperty('top');
        header.style.removeProperty('left');
        header.style.removeProperty('height');
        header.style.removeProperty('overflow');
      }
    }
  }

  // Listen for commands from parent
  window.addEventListener('message', function(e) {
    const data = e.data;
    if (!data || !data.type) return;

    if (data.type === 'strudel-jam:set-pattern' && data.code) {
      if (!setCode(data.code)) {
        pendingCode = data.code;
      }
      parent.postMessage({ type: 'strudel-jam:pattern-updated', code: data.code }, '*');
    }

    if (data.type === 'strudel-jam:evaluate') {
      triggerEval();
    }

    if (data.type === 'strudel-jam:stop') {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = (btn.textContent || '').trim().toLowerCase();
        if (text === 'stop' || text.includes('stop')) {
          btn.click();
          parent.postMessage({ type: 'strudel-jam:stopped' }, '*');
          return;
        }
      }
    }

    if (data.type === 'strudel-jam:inject-css' && data.css) {
      const style = document.createElement('style');
      style.textContent = data.css;
      document.head.appendChild(style);
    }

    if (data.type === 'strudel-jam:toggle-toolbar') {
      hideToolbar(!data.visible);
      parent.postMessage({ type: 'strudel-jam:toolbar-visible', visible: data.visible }, '*');
    }
  });

  // Watch for REPL to finish loading, then stop observing
  const observer = new MutationObserver(function() {
    if (!ready && getCMView()) {
      ready = true;
      observer.disconnect(); // Stop observing - critical for live highlighting performance
      parent.postMessage({ type: 'strudel-jam:ready' }, '*');
      if (pendingCode) {
        setCode(pendingCode);
        pendingCode = null;
      }
      if (pendingEval) {
        triggerEval();
        pendingEval = false;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Also handle real user clicks on the play button to notify parent
  document.addEventListener('click', function(e) {
    const btn = e.target.closest && e.target.closest('button');
    if (!btn) return;
    // Ignore clicks on buttons inside the hidden #header
    if (btn.closest('#header')) return;
    const text = (btn.textContent || '').trim().toLowerCase();
    if (text === 'play' || text === '▶ play' || text === '▶play') {
      parent.postMessage({ type: 'strudel-jam:playing' }, '*');
    }
    if (text === 'stop' || text.includes('stop')) {
      parent.postMessage({ type: 'strudel-jam:stopped' }, '*');
    }
  }, true);
})();
