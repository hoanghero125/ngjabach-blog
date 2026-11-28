// Runs before the page paints so a saved light theme never flashes dark.
// Loaded as a file (not inline) so the Content-Security-Policy can stay strict.
(function () {
  var theme = 'dark';
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (e) {
    // Storage blocked: keep the default.
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
