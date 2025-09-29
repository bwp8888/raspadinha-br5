
(function(){
  if (window.__capi_ic_hooked) return; window.__capi_ic_hooked = true;

  // ---- helpers ----
  function log(evt, extra, value){
    try {
      fetch('/api/capi_logger.php', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({event: evt, page: location.href, value: (value!=null?value:null), extra: extra||null})
      });
    } catch(e){}
  }
  function num(v){ v=parseFloat(v); return isNaN(v)?0:v; }
  function getCookie(name){
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g,'\\$1') + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch(e){ return null; }
  }
  function detectAmount(){
    try { var sv = num(sessionStorage.getItem('paymentValue') || '0'); if (sv>0) return sv; } catch(e){}
    var el = document.querySelector('#amountInput, input[name="amount"], input[name="valor"], input[data-amount]');
    if (el){
      var raw = (el.value || '').toString().replace(/[^\d,\.]/g,'').replace(',','.');
      var v = num(raw); if (v>0) return v;
    }
    return 0;
  }
  function sendInitiateCheckout(val){
    var payload = {
      value: val,
      event_id: 'ic_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
      fbp: getCookie('_fbp') || null,
      fbc: getCookie('_fbc') || null,
      event_source_url: location.href
    };
    log('CAPI_IC_SEND', payload, val);
    fetch('/api/fb_capi_initiate_checkout.php', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    }).then(function(r){ try{return r.json();}catch(e){return null;} })
      .then(function(res){ log('CAPI_IC_SEND_RESPONSE', res, val); })
      .catch(function(){ log('CAPI_IC_SEND_ERROR', null, val); });
  }

  // Boot log to confirm the hook loaded
  log('CAPI_IC_BOOT');

  // ---- Hook 1: Notiflix success message "Pagamento gerado!" ----
  (function hookNotiflix(){
    try {
      if (window.Notiflix && Notiflix.Notify && typeof Notiflix.Notify.success === 'function'){
        var _old = Notiflix.Notify.success.bind(Notiflix.Notify);
        Notiflix.Notify.success = function(msg){
          try {
            if (typeof msg === 'string' && /Pagamento gerado!?/i.test(msg)){
              var v = detectAmount();
              log('CAPI_IC_MATCH_NOTIFLIX', {msg: msg}, v);
              sendInitiateCheckout(v);
            }
          } catch(e){}
          return _old.apply(this, arguments);
        };
      } else {
        var tries = 0; (function wait(){
          if (window.Notiflix && Notiflix.Notify && typeof Notiflix.Notify.success === 'function'){
            try{
              var _old = Notiflix.Notify.success.bind(Notiflix.Notify);
              Notiflix.Notify.success = function(msg){
                try {
                  if (typeof msg === 'string' && /Pagamento gerado!?/i.test(msg)){
                    var v = detectAmount();
                    log('CAPI_IC_MATCH_NOTIFLIX', {msg: msg}, v);
                    sendInitiateCheckout(v);
                  }
                } catch(e){}
                return _old.apply(this, arguments);
              };
            }catch(e){}
          } else if (tries++ < 40){ setTimeout(wait, 250); }
        })();
      }
    } catch(e){}
  })();

  // ---- Hook 2: Intercept fetch for /api/payment.php ----
  (function hookFetch(){
    if (!('fetch' in window)) return;
    var _fetch = window.fetch;
    window.fetch = function(input, init){
      var url = '';
      try { url = (typeof input === 'string') ? input : (input && input.url) || ''; } catch(e){}
      var isPayment = /\/api\/(payment\.php|consult_pix(\.php)?|pix(\/|\.php)?)/.test(url);
      var p = _fetch.apply(this, arguments);
      if (!isPayment) return p;
      try { log('CAPI_IC_FETCH_MATCH', {url:url}); } catch(e){}
      return p.then(function(res){
        try {
          var clone = res.clone();
          clone.json().then(function(data){
            try { log('CAPI_IC_FETCH_RESPONSE', {status: res.status, data: data}); } catch(e){}
            try {
              if (data && (data.qrcode || data.qrCode || data.qr || data.emv || data.brcode || (data.copy && data.copy.code) || data.transactionId)){
                var v = detectAmount();
                log('CAPI_IC_FETCH_TRIGGER', data, v);
                sendInitiateCheckout(v);
              }
            } catch(e){}
          }).catch(function(){ /* not json */ });
        } catch(e){}
        return res;
      });
    };
  })();

  // ---- Hook 3: Intercept XHR for /api/payment.php (compat com jQuery/AJAX) ----
  (function hookXHR(){
    if (!('XMLHttpRequest' in window)) return;
    var _open = XMLHttpRequest.prototype.open;
    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url){
      try { this.__capi_is_payment = /\/api\/(payment\.php|consult_pix(\.php)?|pix(\/|\.php)?)/.test(url); } catch(e){ this.__capi_is_payment = false; }
      return _open.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body){
      if (this.__capi_is_payment){
        try { log('CAPI_IC_XHR_MATCH'); } catch(e){}
        this.addEventListener('load', function(){
          try {
            var txt = this.responseText || '';
            log('CAPI_IC_XHR_RESPONSE', {status: this.status, len: txt.length});
            if (/qrcode|qrCode|brcode|emv|transactionId/i.test(txt)){
              var v = detectAmount();
              log('CAPI_IC_XHR_TRIGGER', null, v);
              sendInitiateCheckout(v);
            }
          } catch(e){}
        });
      }
      return _send.apply(this, arguments);
    };
  })();

})();