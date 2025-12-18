// 8-bit Sound Effects using Web Audio API
// No external API needed - generates retro sounds programmatically

class PixelSoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Classic 8-bit click sound
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  // Success/confirm sound (like Mario coin)
  playSuccess() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    playNote(988, ctx.currentTime, 0.1);
    playNote(1319, ctx.currentTime + 0.1, 0.2);
  }

  // Navigation/select sound
  playSelect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  // Error/warning sound
  playError() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  // Power-up/start sound
  playStart() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Ascending arpeggio
    playNote(262, ctx.currentTime, 0.08);
    playNote(330, ctx.currentTime + 0.08, 0.08);
    playNote(392, ctx.currentTime + 0.16, 0.08);
    playNote(523, ctx.currentTime + 0.24, 0.15);
  }

  // Copy sound
  playCopy() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }

  // Hover sound (subtle)
  playHover() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }
}

// Export singleton instance
export const pixelSound = new PixelSoundManager();
