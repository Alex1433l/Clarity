import { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music2,
  Repeat,
  Repeat1,
  Shuffle,
  X,
  ListMusic,
  Trash2,
} from 'lucide-react';
import { cn } from '@/utils';

interface Track {
  name: string;
  url: string;
}

type RepeatMode = 'off' | 'all' | 'one';

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
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffle, setShuffle] = useState(false);
  const shuffleOrder = useRef<number[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newTracks = Array.from(files).map((f) => ({
      name: f.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(f),
    }));
    setTracks((prev) => [...prev, ...newTracks]);
  };

  const removeTrack = (index: number) => {
    setTracks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index === current) {
        setPlaying(false);
        setProgress(0);
        if (next.length === 0) {
          setCurrent(0);
        } else {
          setCurrent(Math.min(current, next.length - 1));
        }
      } else if (index < current) {
        setCurrent((c) => c - 1);
      }
      return next;
    });
  };

  const buildShuffleOrder = (startIndex: number) => {
    const indices = tracks.map((_, i) => i).filter((i) => i !== startIndex);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    shuffleOrder.current = [startIndex, ...indices];
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
    if (shuffle) {
      const idx = shuffleOrder.current.indexOf(current);
      if (idx < shuffleOrder.current.length - 1) {
        setCurrent(shuffleOrder.current[idx + 1]);
      } else if (repeatMode === 'all') {
        buildShuffleOrder(shuffleOrder.current[0]);
        setCurrent(shuffleOrder.current[0]);
      } else {
        setPlaying(false);
      }
    } else if (current < tracks.length - 1) {
      setCurrent(current + 1);
    } else if (repeatMode === 'all') {
      setCurrent(0);
    } else {
      setPlaying(false);
    }
    setProgress(0);
  };

  const prev = () => {
    if (tracks.length === 0) return;
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    if (shuffle) {
      const idx = shuffleOrder.current.indexOf(current);
      if (idx > 0) {
        setCurrent(shuffleOrder.current[idx - 1]);
      } else if (repeatMode === 'all') {
        setCurrent(shuffleOrder.current[shuffleOrder.current.length - 1]);
      }
    } else if (current > 0) {
      setCurrent(current - 1);
    } else if (repeatMode === 'all') {
      setCurrent(tracks.length - 1);
    }
    setProgress(0);
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const toggleShuffle = () => {
    if (!shuffle && tracks.length > 0) {
      buildShuffleOrder(current);
    }
    setShuffle(!shuffle);
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

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setPlaying(false));
      }
      return;
    }
    next();
  };

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
        onEnded={handleEnded}
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
          <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl bg-white dark:bg-sand-900 border border-sand-200 dark:border-sand-800 shadow-elevated p-4 animate-scale-in origin-top-right">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                  <Music2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <p className="text-sm font-semibold text-sand-800 dark:text-sand-100">Música ambiente</p>
              </div>
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  showPlaylist
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'text-sand-400 hover:text-sand-600 dark:hover:text-sand-200'
                )}
                aria-label="Lista"
              >
                <ListMusic className="w-4 h-4" />
              </button>
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
                <div className="flex items-center justify-center gap-2 mb-3">
                  <button
                    onClick={toggleShuffle}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      shuffle
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'text-sand-400 hover:text-sand-600 dark:hover:text-sand-200'
                    )}
                    aria-label="Aleatório"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button onClick={prev} className="p-1.5 text-sand-500 hover:text-sand-800 dark:hover:text-sand-200 transition-colors">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors shadow-sm">
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button onClick={next} className="p-1.5 text-sand-500 hover:text-sand-800 dark:hover:text-sand-200 transition-colors">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cycleRepeat}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      repeatMode !== 'off'
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'text-sand-400 hover:text-sand-600 dark:hover:text-sand-200'
                    )}
                    aria-label="Repetir"
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 mb-3">
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

            {/* Playlist */}
            {showPlaylist && tracks.length > 0 && (
              <div className="mb-3 max-h-44 overflow-y-auto rounded-xl border border-sand-200 dark:border-sand-800">
                {tracks.map((tr, i) => (
                  <div
                    key={i}
                    onClick={() => { setCurrent(i); setProgress(0); if (!playing) togglePlay(); }}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2 cursor-pointer text-xs transition-colors',
                      i === current
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium'
                        : 'text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800/60'
                    )}
                  >
                    <span className="w-5 text-center text-[10px] text-sand-400 shrink-0">
                      {i === current && playing ? (
                        <span className="flex gap-0.5 items-end h-3 justify-center">
                          {[0, 1, 2].map((j) => (
                            <span key={j} className="w-0.5 bg-brand-500 rounded-full animate-pulse" style={{ height: `${(j + 1) * 3}px`, animationDelay: `${j * 0.15}s` }} />
                          ))}
                        </span>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="flex-1 truncate">{tr.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTrack(i); }}
                      className="p-1 rounded text-sand-300 dark:text-sand-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File input */}
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
