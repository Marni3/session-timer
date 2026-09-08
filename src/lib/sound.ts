/**
 * Pure Web Audio API Sound Synthesizer.
 * Zero external mp3/wav files or network requests required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a gentle, two-tone focus reminder chime (5-minute nudge).
   */
  public playFocusChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    this.playTone(ctx, 587.33, now, 0.8, 0.15);

    // Tone 2: 880.00 Hz (A5) slightly delayed
    this.playTone(ctx, 880.00, now + 0.12, 1.2, 0.12);
  }

  /**
   * Plays a deeper, resonant celebration chime when a task is completed.
   */
  public playCompletionGong(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Fundamental + gentle overtones (F# major chord warmth)
    this.playTone(ctx, 370.00, now, 2.2, 0.25); // F#4
    this.playTone(ctx, 554.37, now + 0.05, 2.0, 0.18); // C#5
    this.playTone(ctx, 739.99, now + 0.1, 1.8, 0.12); // F#5
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    maxGain: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Attack
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.04);

    // Exponential Decay
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }
}

export const soundEngine = new SoundEngine();
