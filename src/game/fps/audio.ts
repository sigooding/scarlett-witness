import type { FpsEvent } from "./types";
/** Small synthesized, original effects; no extracted game recordings. */
export class FpsAudio {
  private context?: AudioContext;
  unlock() {
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch {
      /* audio is optional */
    }
  }
  play(e: FpsEvent) {
    const c = this.context;
    if (!c || c.state !== "running") return;
    const laser = e.type === "shot" && e.id === "laser";
    const bite = e.type === "shot" && e.id === "bite";
    const noise = !laser && !bite && ["shot", "explosion", "hurt", "kick"].includes(e.type);
    if (!noise && !laser && !bite && !["pickup", "door", "secret"].includes(e.type)) return;
    const length =
      e.type === "explosion"
        ? 0.55
        : e.type === "door"
          ? 0.3
          : e.type === "shot" && e.id === "shotgun"
            ? 0.26
            : bite
              ? 0.17
              : 0.12;
    const gain = c.createGain();
    gain.connect(c.destination);
    gain.gain.setValueAtTime(bite ? 0.1 : noise ? 0.13 : 0.045, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + length);
    if (bite) {
      const b = c.createBuffer(
          1,
          Math.ceil(c.sampleRate * length),
          c.sampleRate,
        ),
        values = b.getChannelData(0);
      for (let i = 0; i < values.length; i++)
        values[i] = (Math.random() * 2 - 1) * (1 - i / values.length) * 0.7;
      const source = c.createBufferSource();
      source.buffer = b;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 240;
      filter.Q.value = 0.9;
      source.connect(filter);
      filter.connect(gain);
      source.start();
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    } else if (noise) {
      const b = c.createBuffer(
          1,
          Math.ceil(c.sampleRate * length),
          c.sampleRate,
        ),
        values = b.getChannelData(0);
      for (let i = 0; i < values.length; i++) values[i] = Math.random() * 2 - 1;
      const source = c.createBufferSource();
      source.buffer = b;
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = e.type === "explosion" ? 500 : 2400;
      source.connect(filter);
      filter.connect(gain);
      source.start();
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    } else {
      const source = c.createOscillator();
      source.type = e.type === "door" || laser ? "sawtooth" : "sine";
      source.frequency.setValueAtTime(
        e.type === "door" ? 65 : laser ? 600 : 550,
        c.currentTime,
      );
      source.frequency.exponentialRampToValueAtTime(
        e.type === "door" ? 40 : laser ? 150 : 1100,
        c.currentTime + length,
      );
      source.connect(gain);
      source.start();
      source.stop(c.currentTime + length);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
    }
  }
  dispose() {
    void this.context?.close().catch(() => {});
  }
}
