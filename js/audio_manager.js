
(function(){
  const NAMES = ["ui_chime","scratch_loop","sound_pix_confirm","sound_game_win","sound_game_lose","error_soft"];
  const EXT = ".mp3";
  const BASE = (window.AUDIO_BASE_PATH || "/assets/audio/").replace(/\/+$/,'') + "/";

  class AudioManager {
    constructor(){
      this.enabled = true;             // força habilitado
      this.master = 0.9;
      this.minInterval = 140;
      this.debug = !!window.DEBUG_AUDIO;

      this._lastPlayed = {};
      this._looping = {};
      this._audios = {};
      this._unlocked = false;

      this.preload();
      this._attachUnlock();
      document.addEventListener("visibilitychange", ()=>{
        if (document.hidden) this.stopAll();
      });
    }

    log(...a){ if(this.debug) try{ console.log("[AudioMgr]", ...a);}catch(e){} }

    preload(){
      NAMES.forEach(n => {
        const a = new Audio();
        a.src = BASE + n + EXT;
        a.preload = "auto";
        a.volume = this.master;
        a.playsInline = true;
        a.setAttribute("playsinline","");
        a.dataset.name = n;
        this._audios[n] = a;
      });
    }



    _resolveName(name){
      // Se vier uma chave de config (ex: 'sound_modal_open'), mapeia para arquivo (ex: 'ui_chime.mp3') e remove .mp3
      try {
        if (this._audios[name]) return name;
        var cfg = (window && window.SOUND_CONFIG && window.SOUND_CONFIG[name]) || (window && window.audioManager && window.audioManager.getSoundConfig && window.audioManager.getSoundConfig(name));
        if (cfg && typeof cfg === 'string') {
          var base = cfg.replace(/\.mp3$/i,'');
          return base;
        }
      } catch(e){}
      return name;
    }
    _attachUnlock(){
      const unlock = async () => {
        if (this._unlocked) return;
        let ok = 0;
        for (const n in this._audios){
          const a = this._audios[n];
          try {
            a.muted = true;
            await a.play();  // se falhar, cai no catch
            a.pause();
            a.currentTime = 0;
            a.muted = false;
            ok++;
          } catch(e){
            // ignore, vamos tentar de novo no próximo gesto
          }
        }
        if (ok > 0){
          this._unlocked = true;
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("touchstart", unlock);
          window.removeEventListener("click", unlock);
          this.log("unlocked via gesture");
        } else {
          this.log("unlock attempt failed; will try again on next gesture");
        }
      };
      window.addEventListener("pointerdown", unlock, {passive:true});
      window.addEventListener("touchstart", unlock, {passive:true});
      window.addEventListener("click", unlock, {passive:true});
    }

    _ensureUnlocked(){
      if (this._unlocked) return;
      this.log("ensureUnlocked: not unlocked yet");
      // não marca como unlocked aqui; só gesto humano desbloqueia
    }

    setEnabled(flag){
      // segurança: nunca deixe sons travados por 'false' acidental de localStorage antigo
      this.enabled = (flag !== false);
    }
    setMaster(v){
      this.master = Math.max(0,Math.min(1,v));
      Object.values(this._audios).forEach(a => a.volume = this.master);
    }
    setMinInterval(ms){ this.minInterval = Math.max(0, ms|0); }

    _clone(a){
      const b = new Audio();
      b.src = a.src;
      b.preload = "auto";
      b.volume = this.master;
      b.playsInline = true;
      b.setAttribute("playsinline","");
      return b;
    }

    play(name, opts={}){
      name = this._resolveName(name);
      if (!this.enabled) { this.log("play blocked (disabled)", name); return; }
      const base = this._audios[name];
      if (!base){ this.log("unknown sound", name); return; }

      this._ensureUnlocked();

      const loop = !!opts.loop;
      const vol  = typeof opts.volume==="number" ? opts.volume : this.master;
      const thr  = (opts.throttleMs ?? this.minInterval)|0;

      if (loop){
        // reinicia sempre o loop para evitar "travado"
        this.stop(name);
        const lo = this._clone(base);
        lo.loop = true;
        lo.volume = vol;
        try{ lo.currentTime = 0; }catch(e){}
        const p = lo.play();
        if (p && typeof p.catch === "function"){
          p.catch(()=> this.log("loop play blocked (needs gesture):", name));
        }
        this._looping[name] = lo;
        return;
      }

      const now = performance.now();
      const last = this._lastPlayed[name] || 0;
      if (thr>0 && (now-last)<thr) return;
      this._lastPlayed[name] = now;

      const one = this._clone(base);
      one.volume = vol;
      try{ one.currentTime = 0; }catch(e){}
      const p = one.play();
      if (p && typeof p.catch === "function"){
        p.catch(()=> this.log("one-shot play blocked (needs gesture):", name));
      }
      one.addEventListener("ended", ()=>{ one.src = ""; }, {once:true});
    }

    stop(name){
      const lo = this._looping[name];
      if (lo){
        try{ lo.pause(); lo.currentTime = 0; }catch(e){}
        lo.loop = false;
        delete this._looping[name];
        this.log("stopped loop", name);
      }
    }

    stopAll(){ Object.keys(this._looping).forEach(n => this.stop(n)); }

    startScratch(){ this.play("scratch_loop", {loop:true, volume:0.6}); }
    stopScratch(){ this.stop("scratch_loop"); }
    modalOpen(){ this.play("sound_modal_open"); }
    revealWin(){ this.play("sound_scratch_reveal_win"); }
    pixConfirm(){ this.play("sound_pix_confirm"); }
    gameWin(){ this.play("sound_game_win"); }
    gameLose(){ this.play("sound_game_lose"); }
  }

  window.AudioMgr = new AudioManager();
})();
