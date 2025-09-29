
(function(){
  function onReady(fn){ if (document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function once(el, evt, handler){
    function wrap(e){ try{ el.removeEventListener(evt, wrap); }catch(_){}; handler(e); }
    el.addEventListener(evt, wrap);
  }
  function sendAddPayment(){
    try{
      var payload = {
        event_id: 'addpay_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
        event_source_url: location.href
      };
      fetch('/api/fb_capi_add_payment_info.php', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      }).catch(function(){});
    }catch(e){}
  }
  onReady(function(){
    var btn = document.getElementById('copyQr');
    if (!btn) return;
    btn.addEventListener('click', function(){
      // pequena trava visual contra duplo clique
      if (btn.__ap_lock) return;
      btn.__ap_lock = true; setTimeout(function(){ btn.__ap_lock = false; }, 2000);
      sendAddPayment();
    });
  });
})();
