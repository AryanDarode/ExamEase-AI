import React, { useState, useEffect, useRef } from 'react';
import { saveRelaxationLog } from '../utils/storage';
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Clock,
  Activity,
  Heart,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import './Relaxation.css';

const STRETCHES = [
  { title: 'Neck Releases', desc: 'Slowly tilt your head towards each shoulder. Hold for 15 seconds to ease neck tension.', duration: '1 min' },
  { title: 'Seated Spinal Twist', desc: 'Place your left hand on your right knee, gently twist to the right. Switch sides.', duration: '1 min' },
  { title: 'Shoulder Rolls', desc: 'Roll your shoulders backwards 10 times, then forwards 10 times to release desk strain.', duration: '30 sec' },
  { title: 'Wrist & Finger Stretch', desc: 'Extend your arm with palm facing up, gently pull fingers back with opposite hand.', duration: '45 sec' },
];

export default function Relaxation() {
  const [activeTab, setActiveTab] = useState('breathing'); // 'breathing' | 'stretching' | 'meditation'

  // Audio state
  const audioRef = useRef(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playMusicWithBreathing, setPlayMusicWithBreathing] = useState(true);

  // Breathing state
  const [durationMode, setDurationMode] = useState(120); // 120s (2 min) or 300s (5 min)
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('ready'); // 'ready' | 'inhale' | 'hold' | 'exhale' | 'done'
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(120);
  const [completedSessions, setCompletedSessions] = useState(0);

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  // Set duration mode
  const handleSelectDuration = (secs) => {
    setIsRunning(false);
    setDurationMode(secs);
    setTotalSecondsLeft(secs);
    setPhase('ready');
    setPhaseSecondsLeft(4);
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  // Breathing phase loop
  useEffect(() => {
    let timer;
    if (isRunning && totalSecondsLeft > 0) {
      timer = setInterval(() => {
        setTotalSecondsLeft((prevTotal) => {
          if (prevTotal <= 1) {
            setIsRunning(false);
            setPhase('done');
            saveRelaxationLog('Box Breathing', durationMode);
            setCompletedSessions((c) => c + 1);

            // Gently pause background music when reset finishes
            if (audioRef.current && !audioRef.current.paused) {
              audioRef.current.pause();
              setIsPlayingMusic(false);
            }
            return 0;
          }
          return prevTotal - 1;
        });

        setPhaseSecondsLeft((prevPhaseSec) => {
          if (prevPhaseSec <= 1) {
            // Transition phase
            setPhase((curr) => {
              if (curr === 'ready' || curr === 'exhale') return 'inhale';
              if (curr === 'inhale') return 'hold';
              if (curr === 'hold') return 'exhale';
              return 'inhale';
            });
            return 4; // 4 seconds cycle
          }
          return prevPhaseSec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, totalSecondsLeft, durationMode]);

  const handleStart = () => {
    if (phase === 'done' || totalSecondsLeft === 0) {
      setTotalSecondsLeft(durationMode);
      setPhase('inhale');
      setPhaseSecondsLeft(4);
    } else if (phase === 'ready') {
      setPhase('inhale');
      setPhaseSecondsLeft(4);
    }
    setIsRunning(true);

    // Auto-play background meditation song if enabled
    if (playMusicWithBreathing && audioRef.current && audioRef.current.paused) {
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch((err) => console.warn('Autoplay blocked:', err));
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalSecondsLeft(durationMode);
    setPhase('ready');
    setPhaseSecondsLeft(4);
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  const formatMinSec = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In Slowly';
      case 'hold':
        return 'Hold Breath Gently';
      case 'exhale':
        return 'Breathe Out Completely';
      case 'done':
        return 'Reset Complete! 🌟';
      default:
        return 'Ready to Reset';
    }
  };

  return (
    <div className="relaxation-page animate-fade-in">
      {/* Background audio element for breathing */}
      <audio
        ref={audioRef}
        src={encodeURI('/meditation song.mpeg')}
        preload="metadata"
        loop
      />

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="relax-icon-badge">
            <Wind size={28} />
          </div>
          <div>
            <h1 className="page-title">Quick Reset & Relaxation</h1>
            <p className="page-subtitle">
              Physiological sigh and box breathing with soothing meditation audio to immediately lower study stress.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relax-tabs-row">
        <button
          className={`relax-tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          <Wind size={16} /> Box Breathing (4-4-4)
        </button>
        <button
          className={`relax-tab-btn ${activeTab === 'stretching' ? 'active' : ''}`}
          onClick={() => setActiveTab('stretching')}
        >
          <Activity size={16} /> Desk Stretches
        </button>
        <button
          className={`relax-tab-btn ${activeTab === 'meditation' ? 'active' : ''}`}
          onClick={() => setActiveTab('meditation')}
        >
          <Heart size={16} /> Grounding 5-4-3-2-1
        </button>
      </div>

      {/* Box Breathing Tab */}
      {activeTab === 'breathing' && (
        <div className="breathing-card glass-card">
          <div className="breathing-duration-selectors">
            <button
              className={`btn btn-sm ${durationMode === 120 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSelectDuration(120)}
            >
              2-Minute Quick Reset
            </button>
            <button
              className={`btn btn-sm ${durationMode === 300 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSelectDuration(300)}
            >
              5-Minute Deep Calm
            </button>
          </div>

          {/* Calming Background Meditation Song Toggle */}
          <div className="breathing-music-sync-toggle">
            <label className="music-sync-label">
              <input
                type="checkbox"
                checked={playMusicWithBreathing}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setPlayMusicWithBreathing(checked);
                  if (!checked && audioRef.current && !audioRef.current.paused) {
                    audioRef.current.pause();
                    setIsPlayingMusic(false);
                  } else if (checked && isRunning && audioRef.current && audioRef.current.paused) {
                    audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
                  }
                }}
              />
              <Music size={15} />
              <span>Play calming meditation song while breathing</span>
            </label>

            {playMusicWithBreathing && (
              <div className="breathing-audio-inline-controls">
                <button
                  type="button"
                  className="inline-audio-btn"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  className="inline-vol-slider"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>
            )}

            {isPlayingMusic && (
              <span className="music-active-indicator">
                <span className="live-sound-bar bar1" />
                <span className="live-sound-bar bar2" />
                <span className="live-sound-bar bar3" />
                Audio Playing
              </span>
            )}
          </div>

          {/* Animated Circle Container */}
          <div className="breathing-stage">
            <div className={`breathing-circle-outer phase-${phase}`}>
              <div className="breathing-circle-inner">
                <span className="phase-action-text">{getPhaseInstruction()}</span>
                {phase !== 'done' && phase !== 'ready' && (
                  <span className="phase-count-number">{phaseSecondsLeft}s</span>
                )}
                {phase === 'done' && (
                  <CheckCircle size={36} color="var(--color-success)" />
                )}
              </div>
            </div>
          </div>

          <div className="breathing-timer-display">
            <Clock size={16} />
            <span>Time Remaining: <strong>{formatMinSec(totalSecondsLeft)}</strong></span>
          </div>

          <div className="breathing-controls">
            {!isRunning ? (
              <button className="btn btn-primary btn-lg" onClick={handleStart}>
                <Play size={20} />
                {phase === 'ready' ? 'Start Reset' : 'Resume'}
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg" onClick={handlePause}>
                <Pause size={20} />
                Pause
              </button>
            )}
            <button className="btn btn-ghost btn-icon" onClick={handleReset} title="Reset">
              <RotateCcw size={20} />
            </button>
          </div>

          {completedSessions > 0 && (
            <div className="session-completed-notice animate-fade-in">
              <Sparkles size={16} color="var(--color-success)" />
              <span>Great job! You've completed {completedSessions} reset session(s) today.</span>
            </div>
          )}
        </div>
      )}

      {/* Desk Stretches Tab */}
      {activeTab === 'stretching' && (
        <div className="grid-2 stretches-grid">
          {STRETCHES.map((item, i) => (
            <div key={i} className="glass-card stretch-item-card">
              <div className="stretch-header">
                <h3 className="stretch-title">{item.title}</h3>
                <span className="badge badge--info">{item.duration}</span>
              </div>
              <p className="stretch-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grounding Tab */}
      {activeTab === 'meditation' && (
        <div className="glass-card grounding-card">
          <h2 className="box-title">5-4-3-2-1 Sensory Grounding Technique</h2>
          <p className="section-subtitle" style={{ marginBottom: '20px' }}>
            When thoughts about upcoming exams feel overwhelming, use your immediate sensory environment to anchor yourself back to the present moment:
          </p>

          <div className="grounding-steps">
            <div className="grounding-step">
              <span className="step-num">5</span>
              <div>
                <strong>Acknowledge 5 things you can SEE around you</strong>
                <p>A pen, your desk texture, shadows on the wall, the window, your textbook.</p>
              </div>
            </div>
            <div className="grounding-step">
              <span className="step-num">4</span>
              <div>
                <strong>Acknowledge 4 things you can physically TOUCH</strong>
                <p>The ground beneath your feet, your sweater fabric, your chair backrest.</p>
              </div>
            </div>
            <div className="grounding-step">
              <span className="step-num">3</span>
              <div>
                <strong>Acknowledge 3 things you can HEAR</strong>
                <p>The hum of a fan, distant birds, your own slow breathing.</p>
              </div>
            </div>
            <div className="grounding-step">
              <span className="step-num">2</span>
              <div>
                <strong>Acknowledge 2 things you can SMELL</strong>
                <p>Coffee, pencil wood, fresh air, or your clothing.</p>
              </div>
            </div>
            <div className="grounding-step">
              <span className="step-num">1</span>
              <div>
                <strong>Acknowledge 1 thing you can TASTE</strong>
                <p>A sip of cool water or a mint.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
