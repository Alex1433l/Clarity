import { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music2,
} from 'lucide-react';
import { cn } from '@/utils';

interface Track {
  name: string;
  url: string;
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [open, setOpen] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newTracks = Array.from(files).map((f) => ({
      name: f.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(f),
    }));
    setTracks((prev) => [...prev, ...newTracks]);
  };

  const togglePlay = () => {
    if (tracks.length === 0) return;
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  };

  const next = () => {
    if (tracks.length === 0) return;
    setCurrent((c) => (c + 1) % tracks.length);
    setProgress(0);
  };

  const prev = () => {
    if (tracks.length === 0) return;
    setCurrent((c) => (c - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  useEffect(() => {
    if (!audioRef.current || tracks.length === 0) return;
    audioRef.current.load();
    if (playing) audioRef.current.play().catch(() => setPlaying(false));
  }, [current, tracks]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const track = tracks[current];

  return (
    <div className="relative">
      <audio
        ref={audioRef}
        src={track?.url}
        onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={next}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Icon button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-xl text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors relative"
        aria-label="Música ambiente"
      >
        <Music2 className={cn('w-5 h-5', playing && 'text-brand-600 dark:text-brand-400')} />
        {playing && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5 items-end h-2.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-0.5 bg-brand-500 rounded-full animate-pulse"
                style={{ height: `${(i + 1) * 3}px`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl bg-white dark:bg-sand-900 border border-sand-200 dark:border-sand-800 shadow-elevated p-4 animate-scale-in origin-top-right">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-sm font-semibold text-sand-800 dark:text-sand-100">Música ambiente</p>
            </div>

            {track ? (
              <>
                <p className="text-sm font-medium text-sand-700 dark:text-sand-200 truncate mb-3">{track.name}</p>

                {/* Progress */}
                <div className="h-1.5 bg-sand-200 dark:bg-sand-800 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-sand-400 mb-3">
                  <span>{fmt(progress)}</span>
                  <span>{fmt(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <button onClick={prev} className="p-1.5 text-sand-500 hover:text-sand-800 dark:hover:text-sand-200 transition-colors">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors shadow-sm">
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button onClick={next} className="p-1.5 text-sand-500 hover:text-sand-800 dark:hover:text-sand-200 transition-colors">
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setMuted(!muted)} className="text-sand-400 hover:text-sand-600 dark:hover:text-sand-200">
                    {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                    className="flex-1 h-1.5 accent-brand-600 cursor-pointer"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-sand-500 dark:text-sand-400 text-center py-2 mb-3">
                Selecione arquivos de áudio do seu dispositivo.
              </p>
            )}

            <label className="block">
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <span className="btn-outline w-full cursor-pointer text-xs">
                {tracks.length === 0 ? 'Adicionar áudios' : 'Adicionar mais'}
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
