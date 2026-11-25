/**
 * Solar Boat (مراكب الشمس - GEM Opening Ceremony) Audio Player
 *
 * Uses a persistent HTML5 <audio> element mounted on document.body so that
 * UI re-renders never interrupt playback, respects browser autoplay policies,
 * and toggles play/pause smoothly without restarting from the beginning
 * unless the track has finished.
 */

export class SolarBoatAudioPlayer {
  private audioEl: HTMLAudioElement;
  private isPlayingState: boolean = false;
  private progressPercent: number = 0;
  private usingSynthFallback: boolean = false;
  private audioCtx: AudioContext | null = null;
  private synthGain: GainNode | null = null;
  private synthTimer: number | null = null;
  private onChangeCallback: (playing: boolean, progress: number) => void;
  private onProgressCallback?: (progress: number) => void;

  // Exact uploaded MP3 file path served from public/assets/aistudio/
  public static readonly AUDIO_FILENAME = 'vidssave.com___________________________128KBPS_f1816ccd.mp3';
  public static readonly AUDIO_SRC = `${import.meta.env.BASE_URL}assets/aistudio/vidssave.com___________________________128KBPS_f1816ccd.mp3`;

  constructor(
    onStateChange: (playing: boolean, progress: number) => void,
    onProgress?: (progress: number) => void
  ) {
    this.onChangeCallback = onStateChange;
    this.onProgressCallback = onProgress;
    this.audioEl = this.createOrReuseAudioElement();

    this.audioEl.addEventListener('play', () => {
      if (!this.usingSynthFallback) {
        this.isPlayingState = true;
        this.onChangeCallback(true, this.progressPercent);
      }
    });

    this.audioEl.addEventListener('pause', () => {
      if (!this.usingSynthFallback) {
        this.isPlayingState = false;
        this.onChangeCallback(false, this.progressPercent);
      }
    });

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.audioEl.duration && Number.isFinite(this.audioEl.duration)) {
        this.progressPercent = Math.min(100, Math.max(0, (this.audioEl.currentTime / this.audioEl.duration) * 100));
        if (this.onProgressCallback) {
          this.onProgressCallback(this.progressPercent);
        }
      }
    });

    this.audioEl.addEventListener('ended', () => {
      this.isPlayingState = false;
      this.progressPercent = 0;
      this.audioEl.currentTime = 0;
      this.onChangeCallback(false, 0);
    });
  }

  private createOrReuseAudioElement(): HTMLAudioElement {
    const existing = document.getElementById('solar-boat-audio') as HTMLAudioElement | null;
    if (existing) {
      if (existing.getAttribute('src') !== SolarBoatAudioPlayer.AUDIO_SRC) {
        existing.src = SolarBoatAudioPlayer.AUDIO_SRC;
      }
      return existing;
    }

    const audio = document.createElement('audio');
    audio.id = 'solar-boat-audio';
    audio.src = SolarBoatAudioPlayer.AUDIO_SRC;
    audio.preload = 'metadata';
    audio.setAttribute('aria-label', 'Sun Boat (مراكب الشمس) - Grand Egyptian Museum Opening Ceremony');
    document.body.appendChild(audio);
    return audio;
  }

  public get isPlaying(): boolean {
    return this.isPlayingState;
  }

  public get progress(): number {
    return this.progressPercent;
  }

  public async toggle(): Promise<void> {
    if (this.isPlayingState) {
      this.pause();
    } else {
      await this.play();
    }
  }

  public async play(): Promise<void> {
    try {
      this.usingSynthFallback = false;
      this.audioEl.volume = 0.85;
      await this.audioEl.play();
      this.isPlayingState = true;
      this.onChangeCallback(true, this.progressPercent);
    } catch {
      // Fallback only if browser blocks media decoding or asset is unavailable
      this.startSynthFallback();
    }
  }

  public pause(): void {
    try {
      // Preserves currentTime so resuming picks up smoothly without restarting
      this.audioEl.pause();
    } catch {
      // ignore
    }
    this.stopSynthFallback();
    this.isPlayingState = false;
    this.onChangeCallback(false, this.progressPercent);
  }

  private startSynthFallback(): void {
    this.stopSynthFallback();
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      this.isPlayingState = false;
      this.onChangeCallback(false, this.progressPercent);
      return;
    }

    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }

    const ctx = this.audioCtx;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.24, ctx.currentTime + 0.8);
    masterGain.connect(ctx.destination);
    this.synthGain = masterGain;

    this.usingSynthFallback = true;
    this.isPlayingState = true;
    this.onChangeCallback(true, this.progressPercent);

    const motif = [
      { freq: 146.83, dur: 1.6, type: 'drone' as const },
      { freq: 293.66, dur: 0.75, type: 'harp' as const },
      { freq: 311.13, dur: 0.75, type: 'harp' as const },
      { freq: 369.99, dur: 1.1, type: 'harp' as const },
      { freq: 440.0, dur: 0.8, type: 'harp' as const },
      { freq: 369.99, dur: 0.75, type: 'harp' as const },
      { freq: 311.13, dur: 0.75, type: 'harp' as const },
      { freq: 293.66, dur: 1.4, type: 'harp' as const },
      { freq: 220.0, dur: 1.5, type: 'drone' as const },
      { freq: 440.0, dur: 0.8, type: 'harp' as const },
      { freq: 466.16, dur: 0.7, type: 'harp' as const },
      { freq: 554.37, dur: 1.2, type: 'harp' as const },
      { freq: 587.33, dur: 1.8, type: 'harp' as const },
    ];

    let step = 0;

    const scheduleNote = () => {
      if (!this.usingSynthFallback || !this.audioCtx || !this.synthGain) return;

      const note = motif[step % motif.length];
      const now = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(note.type === 'drone' ? 620 : 1850, now);

      osc.type = note.type === 'drone' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(note.freq, now);

      const peak = note.type === 'drone' ? 0.18 : 0.28;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(peak, now + (note.type === 'drone' ? 0.35 : 0.05));
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + note.dur);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.synthGain);

      osc.start(now);
      osc.stop(now + note.dur + 0.05);

      step += 1;
      this.synthTimer = window.setTimeout(scheduleNote, note.dur * 680);
    };

    scheduleNote();
  }

  private stopSynthFallback(): void {
    this.usingSynthFallback = false;
    if (this.synthTimer !== null) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
    if (this.synthGain && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.synthGain.gain.setValueAtTime(this.synthGain.gain.value, now);
        this.synthGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      } catch {
        // ignore
      }
      this.synthGain = null;
    }
  }
}
