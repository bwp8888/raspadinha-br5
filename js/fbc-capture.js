// assets/js/fbc-capture.js
// Captura parâmetros fbc ou fbclid e grava cookie _fbc sem alterar o valor original.
// Mantém segurança (SameSite) e domínio apropriado.
(function() {
  try {
    var params = new URLSearchParams(window.location.search);

    // Preferência: se veio fbc explicitamente, use ele (vindo do FB quando presente).
    var fbcParam = params.get('fbc');
    var fbclid = params.get('fbclid');
    var found = null;

    if (fbcParam) {
      found = fbcParam;
    } else if (fbclid) {
      // fbclid é gerado pelo FB; construir o valor no formato esperado
      var ts = Math.floor(Date.now() / 1000);
      found = 'fb.1.' + ts + '.' + fbclid;
    }

    if (found) {
      // Define cookie _fbc (nome recomendado) — não sobrescreve se já existir (mantém clique original)
      var existing = (document.cookie.match(new RegExp('(?:^|; )_fbc=([^;]+)')) || [null,null])[1];
      if (!existing) {
        var maxAge = 90*24*60*60; // 90 dias
        var cookieStr = '_fbc=' + encodeURIComponent(found) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
        // Se estamos em HTTPS, adicione Secure
        if (location.protocol === 'https:') cookieStr += '; Secure';
        // Tenta usar domínio com e sem www para cobertura (sem quebrar subdomínios simples)
        try {
          var host = location.hostname;
          // Evita adicionar domain se for localhost or IP
          if (!/^\d+\.\d+\.\d+\.\d+$/.test(host) && host.indexOf('localhost') === -1) {
            var domain = host.replace(/^www\./, '');
            if (domain.split('.').length >= 2) {
              cookieStr += '; domain=.' + domain;
            }
          }
        } catch(e) {}
        document.cookie = cookieStr;
      }

      // Remove sensitive query params from URL (fbclid/fbc) to avoid leaks in analytics/referrers
      try {
        var url = new URL(window.location.href);
        url.searchParams.delete('fbclid');
        url.searchParams.delete('fbc');
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
      } catch(e){}
    }
  } catch (e) { console.warn('fbc-capture error', e); }
})();