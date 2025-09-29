(function(){ try{var __b=new Image();__b.src='/api/capi_log_beacon.php?e=CAPI_PV_JS_LOADED&u='+encodeURIComponent(location.href)+'&t='+Date.now();}catch(e){};
  if (window.__capi_pv_sent) return; window.__capi_pv_sent = true;

  function log(evt, extra){
    try{
      fetch('/api/capi_logger.php', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({event: evt, page: location.href, value: null, extra: extra||null})
      }).catch(function(){ try{var __b=new Image();__b.src='/api/capi_log_beacon.php?e=CAPI_PV_JS_LOADED&u='+encodeURIComponent(location.href)+'&t='+Date.now();}catch(e){};});
    }catch(e){}
  }

  function getCookie(name){
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g,'\\$1') + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    }catch(e){ return null; }
  }

  log('CAPI_PV_BOOT');

  var payload = {
    event_id: 'pv_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
    fbp: getCookie('_fbp') || null,
    fbc: getCookie('_fbc') || null,
    event_source_url: location.href
  };

  log('CAPI_PV_REQUEST', payload);

  // Try POST to server endpoint
  fetch('/api/fb_capi_pageview.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  }).then(function(r){ try{return r.json();}catch(e){return null;} })
    .then(function(res){
      if (!res || !res.ok){
        // fallback beacon GET (GIF) if POST failed or returned not ok
        var img = new Image();
        img.onload = function(){ log('CAPI_PV_BEACON_OK'); };
        img.onerror = function(){ log('CAPI_PV_BEACON_FAIL'); };
        img.src = '/api/capi_pv_beacon.php?e=' + encodeURIComponent(payload.event_id) + '&u=' + encodeURIComponent(location.href) + '&t=' + Date.now();
      }
      log('CAPI_PV_RESPONSE', res);
    }).catch(function(){ try{var __b=new Image();__b.src='/api/capi_log_beacon.php?e=CAPI_PV_JS_LOADED&u='+encodeURIComponent(location.href)+'&t='+Date.now();}catch(e){};
      // network error -> fallback beacon
      try {
        var img = new Image();
        img.onload = function(){ log('CAPI_PV_BEACON_OK'); };
        img.onerror = function(){ log('CAPI_PV_BEACON_FAIL'); };
        img.src = '/api/capi_pv_beacon.php?e=' + encodeURIComponent(payload.event_id) + '&u=' + encodeURIComponent(location.href) + '&t=' + Date.now();
      }catch(e){}
      log('CAPI_PV_RESPONSE_INLINE_ERROR');
    });
})();