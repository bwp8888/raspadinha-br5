(function(){
  var _fbq = window.fbq;
  if (typeof _fbq !== 'function') return;
  window.fbq = function(){
    try {
      var args = Array.prototype.slice.call(arguments);
      if (args[0] === 'track' && args[1] === 'Purchase') {
        if (window.console && console.info) console.info('[CAPI SERVER-ONLY] Bloqueado Purchase no navegador.');
        return; // não envia pelo navegador
      }
    } catch(e){}
    return _fbq.apply(window, arguments);
  };
})();