(function(){
  try { localStorage.setItem("audio_enabled", "true"); } catch(e){}
  if (window.AudioMgr) { try{ window.AudioMgr.setEnabled(true); }catch(e){} }

  // Config: usa o que vier do PHP se existir; senão, defaults
  var CFG = (typeof window.SOUND_CONFIG === "object" && window.SOUND_CONFIG) || {};
  var DEFAULT_CFG = {
    audio_enabled: true,
    audio_volume_master: 0.9,
    min_interval_ms_between_sounds: 160,

    // Mapeamentos de CHAVES -> arquivos .mp3
    sound_modal_open: "ui_chime.mp3",
    sound_scratch_loop: "scratch_loop.mp3",
    sound_scratch_reveal_win: "ui_chime.mp3",
    sound_pix_confirm: "sound_pix_confirm.mp3",
    sound_game_win: "sound_game_win.mp3",
    sound_game_lose: "sound_game_lose.mp3",
    sound_error_soft: "error_soft.mp3"
  };

  // Aplica volume/intervalo no gerenciador base
  try {
    if (window.AudioMgr){
      var master = (typeof CFG.audio_volume_master === "number" ? CFG.audio_volume_master : DEFAULT_CFG.audio_volume_master);
      var gap    = (typeof CFG.min_interval_ms_between_sounds === "number" ? CFG.min_interval_ms_between_sounds : DEFAULT_CFG.min_interval_ms_between_sounds);
      window.AudioMgr.setMaster(master);
      window.AudioMgr.setMinInterval(gap|0);
      window.AudioMgr.setEnabled(CFG.audio_enabled !== false);
    }
  } catch(e){}

  // Helper para resolver chave -> arquivo
  function resolveFileFromKey(name){
    if (!name) return name;
    var v = (CFG && Object.prototype.hasOwnProperty.call(CFG, name)) ? CFG[name] : DEFAULT_CFG[name];
    return v || name;
  }

  // API simples pra ser usada no site
  window.audioManager = {
    getSoundConfig: function(name){ return resolveFileFromKey(name); },
    setVolume: function(v){ if (window.AudioMgr) try{ window.AudioMgr.setMaster(Number(v)||0; }catch(e){} },
    enable: function(){ if (window.AudioMgr) try{ window.AudioMgr.setEnabled(true); }catch(e){} },
    disable:function(){ if (window.AudioMgr) try{ window.AudioMgr.setEnabled(false); }catch(e){} },

    // Aceita: 'ui_chime', 'ui_chime.mp3', ou uma CHAVE (ex: 'sound_modal_open')
    play: function(name){
      if (!window.AudioMgr) return;
      var mapped = resolveFileFromKey(name);
      var base = String(mapped).replace(/\.mp3$/i,'');
      window.AudioMgr.play(base);
    },
    // Compatibilidade com chamadas antigas (components/modals.php usa playSound)
    playSound: function(name){ return this.play(name); },

    startScratch: function(){ if (window.AudioMgr) window.AudioMgr.startScratch(); },
    stopScratch:  function(){ if (window.AudioMgr) window.AudioMgr.stopScratch(); }
  };

})();