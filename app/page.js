'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const oscillatorsRef = useRef([]);

  const steps = [
    {
      title: "Select Fresh Fish",
      description: "Choose premium salmon or sea bass, firm flesh, clear eyes",
      image: "🐟",
      sound: "ambient",
      duration: 8000
    },
    {
      title: "Season & Marinate",
      description: "Brush with olive oil, sprinkle sea salt, cracked pepper, fresh herbs",
      image: "🧂",
      sound: "sprinkle",
      duration: 10000
    },
    {
      title: "Prepare the Pan",
      description: "Heat cast iron skillet, medium-high flame, watch for shimmer",
      image: "🔥",
      sound: "sizzle",
      duration: 7000
    },
    {
      title: "Sear the Fish",
      description: "Lay fish skin-side down, crispy golden perfection, 4 minutes",
      image: "🍳",
      sound: "crisp",
      duration: 12000
    },
    {
      title: "Flip & Finish",
      description: "Gentle turn, baste with butter, lemon zest, aromatic thyme",
      image: "🧈",
      sound: "butter",
      duration: 10000
    },
    {
      title: "Plate & Serve",
      description: "Rest on warm plate, drizzle reduction, garnish with microgreens",
      image: "✨",
      sound: "complete",
      duration: 8000
    }
  ];

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.connect(audioContextRef.current.destination);
    masterGainRef.current.gain.value = volume;

    return () => {
      stopAllSounds();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, [volume]);

  const stopAllSounds = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
  };

  const playAmbientSound = (type) => {
    if (!audioContextRef.current) return;

    stopAllSounds();
    const ctx = audioContextRef.current;

    // Background ambient drone
    const ambient = ctx.createOscillator();
    const ambientGain = ctx.createGain();
    ambient.type = 'sine';
    ambient.frequency.value = 110;
    ambientGain.gain.value = 0.05;
    ambient.connect(ambientGain);
    ambientGain.connect(masterGainRef.current);
    ambient.start();
    oscillatorsRef.current.push(ambient);

    // Add harmonics for richness
    const harmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();
    harmonic.type = 'sine';
    harmonic.frequency.value = 165;
    harmonicGain.gain.value = 0.03;
    harmonic.connect(harmonicGain);
    harmonicGain.connect(masterGainRef.current);
    harmonic.start();
    oscillatorsRef.current.push(harmonic);

    // Sound effects based on step
    if (type === 'sprinkle') {
      // High frequency sparkles for seasoning
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const sparkle = ctx.createOscillator();
          const sparkleGain = ctx.createGain();
          sparkle.type = 'sine';
          sparkle.frequency.value = 2000 + Math.random() * 1000;
          sparkleGain.gain.value = 0.1;
          sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          sparkle.connect(sparkleGain);
          sparkleGain.connect(masterGainRef.current);
          sparkle.start();
          sparkle.stop(ctx.currentTime + 0.3);
        }, i * 200);
      }
    } else if (type === 'sizzle' || type === 'crisp') {
      // Brown noise for sizzling
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      const brownNoise = ctx.createBufferSource();
      brownNoise.buffer = noiseBuffer;
      brownNoise.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.08;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      brownNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGainRef.current);
      brownNoise.start();
      oscillatorsRef.current.push(brownNoise);
    } else if (type === 'butter') {
      // Smooth low frequency for butter
      const butter = ctx.createOscillator();
      const butterGain = ctx.createGain();
      butter.type = 'triangle';
      butter.frequency.value = 150;
      butterGain.gain.value = 0.06;
      butterGain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 2);
      butter.connect(butterGain);
      butterGain.connect(masterGainRef.current);
      butter.start();
      oscillatorsRef.current.push(butter);
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    playAmbientSound(steps[0].sound);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      playAmbientSound(steps[nextStep].sound);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      playAmbientSound(steps[prevStep].sound);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    stopAllSounds();
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
          stopAllSounds();
        }
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep]);

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGradient}></div>

      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>CINEMATIC FISH RECIPE</h1>
          <p className={styles.subtitle}>An 8K Ultra Realistic Culinary Journey</p>
        </header>

        {!isPlaying && currentStep === 0 ? (
          <div className={styles.startScreen}>
            <div className={styles.heroIcon}>🐟</div>
            <h2 className={styles.heroTitle}>Master the Art of Fish</h2>
            <p className={styles.heroDescription}>
              Immerse yourself in a cinematic cooking experience with synchronized visuals,
              ambient soundscapes, and crispy ASMR cooking sounds.
            </p>
            <button className={styles.startButton} onClick={handleStart}>
              Begin Journey
            </button>
          </div>
        ) : (
          <div className={styles.recipeContainer}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>Step {currentStep + 1} of {steps.length}</div>
              <div className={styles.iconDisplay}>{steps[currentStep].image}</div>
              <h2 className={styles.stepTitle}>{steps[currentStep].title}</h2>
              <p className={styles.stepDescription}>{steps[currentStep].description}</p>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                    transition: 'width 0.5s ease-out'
                  }}
                ></div>
              </div>

              {isPlaying && (
                <div className={styles.autoPlayIndicator}>
                  <div className={styles.pulse}></div>
                  Auto-playing...
                </div>
              )}
            </div>

            <div className={styles.controls}>
              <button
                className={styles.controlButton}
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                ← Previous
              </button>
              <button
                className={styles.controlButton}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                className={styles.controlButton}
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
              >
                Next →
              </button>
              <button
                className={styles.controlButton}
                onClick={handleReset}
              >
                ↻ Reset
              </button>
            </div>

            <div className={styles.volumeControl}>
              <span className={styles.volumeLabel}>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className={styles.volumeSlider}
              />
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <p>🎵 Ambient soundscapes generated in real-time</p>
        </footer>
      </div>
    </div>
  );
}
