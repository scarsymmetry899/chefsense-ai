'use client';

type TonePreset = {
  start: number;
  end: number;
  duration: number;
};

const PRESETS: Record<'tap' | 'check' | 'start' | 'stop', TonePreset> = {
  tap: { start: 420, end: 480, duration: 0.05 },
  check: { start: 520, end: 660, duration: 0.07 },
  start: { start: 360, end: 520, duration: 0.09 },
  stop: { start: 460, end: 300, duration: 0.08 },
};

export function playSoundEffect(type: keyof typeof PRESETS) {
  if (typeof window === 'undefined') return;

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  const context = new AudioContextCtor();
  const preset = PRESETS[type];
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(preset.start, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(preset.end, context.currentTime + preset.duration);

  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + preset.duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + preset.duration + 0.01);

  oscillator.onended = () => {
    void context.close();
  };
}
