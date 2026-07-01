import React, { useState, useEffect, useRef } from "react";
import { 
  Play, RotateCcw, Trophy, Target, Zap, 
  ChevronLeft, Award, Crown, Flame, Shield, HelpCircle, 
  Check, Sparkles, Smile, Volume2, Timer, Music, Heart, MessageSquare, Activity
} from "lucide-react";

type GameType = "select" | "geometry" | "rhythm" | "memory" | "guesser";

interface Card {
  id: number;
  icon: React.ReactNode;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Beat {
  id: number;
  lane: number; // 0, 1, 2
  y: number; // percentage from top 0 to 100
}

interface Obstacle {
  id: number;
  x: number; // percentage from left 0 to 100
  type: "spike" | "double" | "block";
  width: number;
  height: number;
  passed: boolean;
}

export default function Game() {
  const [activeGame, setActiveGame] = useState<GameType>("select");
  const [score, setScore] = useState(0);
  const [effectText, setEffectText] = useState("");
  const [effectX, setEffectX] = useState(0);
  const [effectY, setEffectY] = useState(0);
  const [effectVisible, setEffectVisible] = useState(false);

  // High scores from localStorage
  const [highScores, setHighScores] = useState({
    geometry: parseInt(localStorage.getItem("arcade_hs_geometry") || "0", 10),
    rhythm: parseInt(localStorage.getItem("arcade_hs_rhythm") || "0", 10),
    memory: parseInt(localStorage.getItem("arcade_hs_memory") || "0", 10),
    guesser: parseInt(localStorage.getItem("arcade_hs_guesser") || "0", 10),
  });

  // GAME STATE Controls
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // 1. GAME: GEOMETRY DASH (CUBE JUMP)
  const [playerY, setPlayerY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [levelProgress, setLevelProgress] = useState(0); // 0% to 100%

  // Geometry game high-performance physics refs
  const geoPlayerYRef = useRef(0);
  const geoObstaclesRef = useRef<Obstacle[]>([]);
  const geoScoreRef = useRef(0);
  const geoLevelProgressRef = useRef(0);
  const geoIsGameOverRef = useRef(false);
  const geoIsJumpingRef = useRef(false);

  const playerVelocity = useRef(0);
  const geometryFrameId = useRef<number | null>(null);
  const obstacleIdCounter = useRef(0);
  const lastObstacleSpawnX = useRef(100);
  const distanceTraveled = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoLastTimeRef = useRef<number>(0);
  const rhythmLastTimeRef = useRef<number>(0);

  // Physics constants for Geometry Dash
  const gravity = 0.16;
  const jumpForce = 3.6;
  const gameSpeed = 1.1;

  // 2. GAME: MXRNINGSTAR RHYTHM BEATS
  const [beats, setBeats] = useState<Beat[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [combo, setCombo] = useState(0);
  const [health, setHealth] = useState(100);

  // Rhythm game high-performance state refs
  const rhythmBeatsRef = useRef<Beat[]>([]);
  const rhythmComboRef = useRef(0);
  const rhythmMultiplierRef = useRef(1);
  const rhythmHealthRef = useRef(100);
  const rhythmScoreRef = useRef(0);
  const rhythmIsGameOverRef = useRef(false);

  const rhythmFrameId = useRef<number | null>(null);
  const beatIdCounter = useRef(0);
  const lastSpawnTime = useRef(0);

  // 3. GAME: MEMORY MATCH
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryTime, setMemoryTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 4. GAME: ANIME GUESSER
  const [guesserQuestions, setGuesserQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [guesserLives, setGuesserLives] = useState(3);
  const [guesserTimeLeft, setGuesserTimeLeft] = useState(15);
  const [guesserStreak, setGuesserStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<"correct" | "incorrect" | null>(null);
  const [correctOption, setCorrectOption] = useState<string | null>(null);
  const guesserTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update overall high score function
  const updateHighScore = (game: "geometry" | "rhythm" | "memory" | "guesser", currentScore: number) => {
    if (currentScore > highScores[game]) {
      const newHighs = { ...highScores, [game]: currentScore };
      setHighScores(newHighs);
      localStorage.setItem(`arcade_hs_${game}`, currentScore.toString());
    }
  };

  const triggerEffect = (text: string, x: number, y: number) => {
    setEffectText(text);
    setEffectX(x);
    setEffectY(y);
    setEffectVisible(true);
    setTimeout(() => {
      setEffectVisible(false);
    }, 850);
  };

  // ==========================================
  // GAME 1: GEOMETRY DASH (CUBE RUN) LOOP
  // ==========================================
  useEffect(() => {
    if (activeGame !== "geometry" || !gameStarted || gameOver || gameWon) {
      if (geometryFrameId.current) cancelAnimationFrame(geometryFrameId.current);
      return;
    }

    const updateGeometry = () => {
      if (geoIsGameOverRef.current) return;

      const now = performance.now();
      const dt = (now - geoLastTimeRef.current) / 1000;
      geoLastTimeRef.current = now;

      const cappedDt = Math.min(dt, 0.1);
      const timeScale = cappedDt * 60; // normalize around 60 FPS

      // 1. Player Physics (Gravity and Jump)
      playerVelocity.current -= gravity * timeScale;
      let nextY = geoPlayerYRef.current + playerVelocity.current * timeScale;
      if (nextY <= 0) {
        nextY = 0;
        playerVelocity.current = 0;
        geoIsJumpingRef.current = false;
        setIsJumping(false);
      }
      geoPlayerYRef.current = nextY;
      setPlayerY(nextY);

      // 2. Increment distance and progress
      distanceTraveled.current += 1 * timeScale;
      const currentProgress = Math.min((distanceTraveled.current / 1200) * 100, 100);
      const roundedProgress = Math.floor(currentProgress);
      geoLevelProgressRef.current = roundedProgress;
      setLevelProgress(roundedProgress);

      if (currentProgress >= 100) {
        setGameWon(true);
        const finalScore = geoScoreRef.current + 500;
        geoScoreRef.current = finalScore;
        setScore(finalScore);
        updateHighScore("geometry", finalScore);
        triggerEffect("LEVEL COMPLETED! 🏆", 50, 50);
        if (geometryFrameId.current) cancelAnimationFrame(geometryFrameId.current);
        return;
      }

      // 3. Spawning Obstacles dynamically
      let updatedObstacles = geoObstaclesRef.current.map((obs) => ({
        ...obs,
        x: obs.x - gameSpeed * timeScale,
      }));

      // Remove out-of-screen obstacles and increase score
      let scoreGained = 0;
      let activeObs = updatedObstacles.filter((obs) => {
        if (obs.x < -10) {
          if (!obs.passed) {
            scoreGained += 50;
          }
          return false;
        }
        return true;
      });

      if (scoreGained > 0) {
        geoScoreRef.current += scoreGained;
        setScore(geoScoreRef.current);
      }

      // Spawn a new obstacle if the last one has moved enough
      const rightmostX = activeObs.length > 0 ? Math.max(...activeObs.map((o) => o.x)) : 0;
      if (rightmostX < 65 && Math.random() < 0.02 * timeScale) {
        const rand = Math.random();
        let type: "spike" | "double" | "block" = "spike";
        let width = 5;
        let height = 12;

        if (rand > 0.7) {
          type = "double";
          width = 8;
          height = 12;
        } else if (rand > 0.45) {
          type = "block";
          width = 6;
          height = 14;
        }

        activeObs.push({
          id: obstacleIdCounter.current++,
          x: 100,
          type,
          width,
          height,
          passed: false,
        });
      }

      geoObstaclesRef.current = activeObs;
      setObstacles(activeObs);

      // 4. Collision Detection with slightly generous hitboxes
      const playerLeft = 16.5;
      const playerRight = 19.5;
      
      activeObs.forEach((obs) => {
        const obsLeft = obs.x + obs.width * 0.15;
        const obsRight = obs.x + obs.width * 0.85;
        const obsTop = obs.height * 0.85; // slight visual buffer

        // AABB Collision overlap checking
        const xOverlap = playerRight > obsLeft && playerLeft < obsRight;
        const yOverlap = nextY < obsTop;

        if (xOverlap && yOverlap) {
          geoIsGameOverRef.current = true;
          setGameOver(true);
          updateHighScore("geometry", geoScoreRef.current);
          triggerEffect("CRASHED! 💥", 20, 50);
        }
      });

      if (!geoIsGameOverRef.current) {
        geometryFrameId.current = requestAnimationFrame(updateGeometry);
      }
    };

    geoLastTimeRef.current = performance.now();
    geometryFrameId.current = requestAnimationFrame(updateGeometry);
    return () => {
      if (geometryFrameId.current) cancelAnimationFrame(geometryFrameId.current);
    };
  }, [activeGame, gameStarted, gameOver, gameWon]);

  // Jump control triggers (Keyboard and Space) - bound only once!
  useEffect(() => {
    if (activeGame !== "geometry" || !gameStarted || gameOver || gameWon) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        triggerGeometryJump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGame, gameStarted, gameOver, gameWon]);

  const startGeometry = () => {
    geoScoreRef.current = 0;
    setScore(0);
    geoPlayerYRef.current = 0;
    setPlayerY(0);
    geoIsJumpingRef.current = false;
    setIsJumping(false);
    playerVelocity.current = 0;
    
    const initialObs = [
      { id: obstacleIdCounter.current++, x: 100, type: "spike", width: 5, height: 12, passed: false },
      { id: obstacleIdCounter.current++, x: 140, type: "block", width: 6, height: 14, passed: false },
    ];
    geoObstaclesRef.current = initialObs;
    setObstacles(initialObs);
    
    geoLevelProgressRef.current = 0;
    setLevelProgress(0);
    distanceTraveled.current = 0;
    obstacleIdCounter.current = 2;
    geoIsGameOverRef.current = false;
    setGameOver(false);
    setGameWon(false);
    geoLastTimeRef.current = performance.now();
    setGameStarted(true);
  };

  const triggerGeometryJump = () => {
    if (geoPlayerYRef.current === 0 && !geoIsJumpingRef.current) {
      playerVelocity.current = jumpForce;
      geoIsJumpingRef.current = true;
      setIsJumping(true);
    }
  };


  // ==========================================
  // GAME 2: MXRNINGSTAR RHYTHM BEATS LOOP
  // ==========================================
  useEffect(() => {
    if (activeGame !== "rhythm" || !gameStarted || gameOver) {
      if (rhythmFrameId.current) cancelAnimationFrame(rhythmFrameId.current);
      return;
    }

    const gameLoop = (timestamp: number) => {
      if (rhythmIsGameOverRef.current) return;

      const now = performance.now();
      const dt = (now - rhythmLastTimeRef.current) / 1000;
      rhythmLastTimeRef.current = now;

      const cappedDt = Math.min(dt, 0.1);
      const timeScale = cappedDt * 60; // normalize around 60 FPS

      // Spawn new beat every 1.1 seconds
      if (timestamp - lastSpawnTime.current > 1100) {
        const randomLane = Math.floor(Math.random() * 3);
        const newBeat = {
          id: beatIdCounter.current++,
          lane: randomLane,
          y: 0,
        };
        rhythmBeatsRef.current.push(newBeat);
        setBeats([...rhythmBeatsRef.current]);
        lastSpawnTime.current = timestamp;
      }

      // Move beats down
      let hitBottomCount = 0;
      rhythmBeatsRef.current = rhythmBeatsRef.current.map((beat) => {
        const nextY = beat.y + 1.25 * timeScale; // Speed of beats
        return { ...beat, y: nextY };
      }).filter((beat) => {
        if (beat.y >= 96) {
          hitBottomCount++;
          return false;
        }
        return true;
      });

      if (hitBottomCount > 0) {
        rhythmComboRef.current = 0;
        setCombo(0);
        rhythmMultiplierRef.current = 1;
        setMultiplier(1);
        
        const nextH = Math.max(rhythmHealthRef.current - 8 * hitBottomCount, 0);
        rhythmHealthRef.current = nextH;
        setHealth(nextH);

        if (nextH <= 0) {
          rhythmIsGameOverRef.current = true;
          setGameOver(true);
          updateHighScore("rhythm", rhythmScoreRef.current);
        }
      }

      setBeats([...rhythmBeatsRef.current]);

      if (!rhythmIsGameOverRef.current) {
        rhythmFrameId.current = requestAnimationFrame(gameLoop);
      }
    };

    rhythmLastTimeRef.current = performance.now();
    rhythmFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (rhythmFrameId.current) cancelAnimationFrame(rhythmFrameId.current);
    };
  }, [activeGame, gameStarted, gameOver]);

  // Keyboard controls for rhythm game - bound only once per game session!
  useEffect(() => {
    if (activeGame !== "rhythm" || !gameStarted || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1" || e.key === "ArrowLeft") {
        triggerHitLane(0);
      } else if (e.key === "2" || e.key === "ArrowDown") {
        triggerHitLane(1);
      } else if (e.key === "3" || e.key === "ArrowRight") {
        triggerHitLane(2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGame, gameStarted, gameOver]);

  const startRhythm = () => {
    rhythmScoreRef.current = 0;
    setScore(0);
    rhythmBeatsRef.current = [];
    setBeats([]);
    rhythmComboRef.current = 0;
    setCombo(0);
    rhythmMultiplierRef.current = 1;
    setMultiplier(1);
    rhythmHealthRef.current = 100;
    setHealth(100);
    rhythmIsGameOverRef.current = false;
    setGameOver(false);
    rhythmLastTimeRef.current = performance.now();
    setGameStarted(true);
    lastSpawnTime.current = performance.now();
  };

  const triggerHitLane = (laneIndex: number) => {
    if (rhythmIsGameOverRef.current) return;

    const candidates = rhythmBeatsRef.current.filter((b) => b.lane === laneIndex);
    if (candidates.length === 0) {
      rhythmComboRef.current = 0;
      setCombo(0);
      rhythmMultiplierRef.current = 1;
      setMultiplier(1);
      
      const nextH = Math.max(rhythmHealthRef.current - 4, 0);
      rhythmHealthRef.current = nextH;
      setHealth(nextH);

      if (nextH <= 0) {
        rhythmIsGameOverRef.current = true;
        setGameOver(true);
        updateHighScore("rhythm", rhythmScoreRef.current);
      }
      return;
    }

    const targetY = 85;
    let closestBeat: Beat | null = null;
    let minDistance = 999;

    candidates.forEach((beat) => {
      const distance = Math.abs(beat.y - targetY);
      if (distance < minDistance) {
        minDistance = distance;
        closestBeat = beat;
      }
    });

    if (closestBeat) {
      const beatVal: Beat = closestBeat;
      const distance = Math.abs(beatVal.y - targetY);

      if (distance < 8) {
        const addedScore = 15 * rhythmMultiplierRef.current;
        rhythmScoreRef.current += addedScore;
        setScore(rhythmScoreRef.current);

        rhythmComboRef.current += 1;
        setCombo(rhythmComboRef.current);

        const nextH = Math.min(rhythmHealthRef.current + 4, 100);
        rhythmHealthRef.current = nextH;
        setHealth(nextH);

        triggerEffect("PERFECT! 🔥", (laneIndex + 1) * 25, 80);
        rhythmBeatsRef.current = rhythmBeatsRef.current.filter((b) => b.id !== beatVal.id);
        setBeats([...rhythmBeatsRef.current]);
      } else if (distance < 16) {
        const addedScore = 8 * rhythmMultiplierRef.current;
        rhythmScoreRef.current += addedScore;
        setScore(rhythmScoreRef.current);

        rhythmComboRef.current += 1;
        setCombo(rhythmComboRef.current);

        const nextH = Math.min(rhythmHealthRef.current + 2, 100);
        rhythmHealthRef.current = nextH;
        setHealth(nextH);

        triggerEffect("GOOD! 👍", (laneIndex + 1) * 25, 80);
        rhythmBeatsRef.current = rhythmBeatsRef.current.filter((b) => b.id !== beatVal.id);
        setBeats([...rhythmBeatsRef.current]);
      } else {
        rhythmComboRef.current = 0;
        setCombo(0);
        rhythmMultiplierRef.current = 1;
        setMultiplier(1);

        const nextH = Math.max(rhythmHealthRef.current - 6, 0);
        rhythmHealthRef.current = nextH;
        setHealth(nextH);

        if (nextH <= 0) {
          rhythmIsGameOverRef.current = true;
          setGameOver(true);
          updateHighScore("rhythm", rhythmScoreRef.current);
        }

        triggerEffect("MISS! ❌", (laneIndex + 1) * 25, 80);
      }
    }

    // Update multiplier based on combo
    const c = rhythmComboRef.current;
    let nextMultiplier = 1;
    if (c >= 15) nextMultiplier = 4;
    else if (c >= 8) nextMultiplier = 3;
    else if (c >= 4) nextMultiplier = 2;
    rhythmMultiplierRef.current = nextMultiplier;
    setMultiplier(nextMultiplier);
  };


  // ==========================================
  // GAME 3: MEMORY MATCH LOGIC (REPLACEMENT ICONS)
  // ==========================================
  const cardSymbols = [
    { icon: <Crown className="w-6 h-6 text-yellow-400" />, name: "Crown" },
    { icon: <Flame className="w-6 h-6 text-orange-500" />, name: "Fire" },
    { icon: <Shield className="w-6 h-6 text-blue-400" />, name: "Shield" },
    { icon: <Award className="w-6 h-6 text-purple-400" />, name: "Medal" },
    { icon: <Zap className="w-6 h-6 text-amber-400" />, name: "Lightning" },
    { icon: <Sparkles className="w-6 h-6 text-emerald-400" />, name: "Sparkles" },
  ];

  const initMemoryGame = () => {
    const initialCards: Card[] = [];
    let idCounter = 1;

    cardSymbols.forEach((symbol) => {
      initialCards.push({
        id: idCounter++,
        icon: symbol.icon,
        name: symbol.name,
        isFlipped: false,
        isMatched: false,
      });
      initialCards.push({
        id: idCounter++,
        icon: symbol.icon,
        name: symbol.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffled = initialCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setScore(0);
    setMemoryMoves(0);
    setMemoryTime(0);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setMemoryTime((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched || !gameStarted || gameOver) {
      return;
    }

    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].name === cards[secondIdx].name) {
        setTimeout(() => {
          const matchedCards = [...updatedCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);

          const nextScore = score + 10;
          setScore(nextScore);
          triggerEffect("MATCH! 🌟", 50, 50);

          if (matchedCards.every((c) => c.isMatched)) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameOver(true);
            const bonusScore = Math.max(200 - memoryTime * 2 - memoryMoves * 3, 50);
            const finalScore = nextScore + bonusScore;
            setScore(finalScore);
            updateHighScore("memory", finalScore);
          }
        }, 600);
      } else {
        setTimeout(() => {
          const revertedCards = [...updatedCards];
          revertedCards[firstIdx].isFlipped = false;
          revertedCards[secondIdx].isFlipped = false;
          setCards(revertedCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // ==========================================
  // GAME 4: ANIME GUESSER FUNCTIONS
  // ==========================================
  const playSound = (type: "ding" | "buzz") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === "ding") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150.00, now);
        osc.frequency.linearRampToValueAtTime(110.00, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn("Audio Context failed to play sound:", e);
    }
  };

  const startGuesser = async () => {
    setScore(0);
    setGuesserLives(3);
    setGuesserStreak(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerState(null);
    setCorrectOption(null);
    setGuesserTimeLeft(15);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);

    const fallbackQuestions = [
      {
        id: 1,
        emojis: "🏴‍☠️🍖⛵⚔️👑",
        answer: "One Piece",
        options: ["One Piece", "Naruto", "Fairy Tail", "Attack on Titan"],
        image: "https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_Art.png",
        video: "S8_YwFLCh4Y"
      },
      {
        id: 2,
        emojis: "🦊🍥⚡👁️🥷",
        answer: "Naruto",
        options: ["Bleach", "Naruto", "Jujutsu Kaisen", "My Hero Academia"],
        image: "https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg",
        video: "2Z2P6f83vCg"
      },
      {
        id: 3,
        emojis: "⚔️🐗⚡🎋👹",
        answer: "Demon Slayer",
        options: ["Demon Slayer", "Jujutsu Kaisen", "Inuyasha", "Tokyo Ghoul"],
        image: "https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg",
        video: "VQGCKyvzIM4"
      },
      {
        id: 4,
        emojis: "🧱🦖🗡️🎖️🔥",
        answer: "Attack on Titan",
        options: ["Attack on Titan", "Sword Art Online", "Fullmetal Alchemist", "Gundam"],
        image: "https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg",
        video: "MGRm4IzK1SQ"
      },
      {
        id: 5,
        emojis: "🐉🟠☄️🥋🐒",
        answer: "Dragon Ball",
        options: ["One Punch Man", "Hunter x Hunter", "Dragon Ball", "Fist of the North Star"],
        image: "https://upload.wikimedia.org/wikipedia/en/c/c9/Dragon_Ball_Volume_1_cover.jpg",
        video: "W7I7YJv3Wno"
      },
      {
        id: 6,
        emojis: "🍎📓🖊️📓💀",
        answer: "Death Note",
        options: ["Tokyo Ghoul", "Death Note", "Monster", "Code Geass"],
        image: "https://upload.wikimedia.org/wikipedia/en/6/6f/Death_Note_Vol_1.jpg",
        video: "u_C4VvHIsD4"
      },
      {
        id: 7,
        emojis: "🦸‍♂️🏫💥🥦🔥",
        answer: "My Hero Academia",
        options: ["My Hero Academia", "Assassination Classroom", "Mob Psycho 100", "Black Clover"],
        image: "https://upload.wikimedia.org/wikipedia/en/3/32/My_Hero_Academia_volume_1_cover.png",
        video: "EP_8pYgNbyg"
      },
      {
        id: 8,
        emojis: "🤞👁️😈🎴👹",
        answer: "Jujutsu Kaisen",
        options: ["Chainsaw Man", "Jujutsu Kaisen", "Bleach", "Soul Eater"],
        image: "https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_Kaisen_volume_1_cover.jpg",
        video: "pkKu9hLT-t8"
      },
      {
        id: 9,
        emojis: "🎣🥋🐜⚡🃏",
        answer: "Hunter x Hunter",
        options: ["Hunter x Hunter", "Yu Yu Hakusho", "Fairy Tail", "Toriko"],
        image: "https://upload.wikimedia.org/wikipedia/en/0/0f/Hunter_x_Hunter_vol_1.jpg",
        video: "d6kBeJjUqnk"
      },
      {
        id: 10,
        emojis: "🌙🐱🎀✨💫",
        answer: "Sailor Moon",
        options: ["Cardcaptor Sakura", "Sailor Moon", "Madoka Magica", "PreCure"],
        image: "https://upload.wikimedia.org/wikipedia/en/2/22/Pretty_Guardian_Sailor_Moon_volume_1_shins%C5%8Dban_cover.jpg",
        video: "5m68S_1_NqI"
      }
    ];

    try {
      const response = await fetch("/data.json");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setGuesserQuestions(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch data.json, using fallback questions", e);
    }
    
    setGuesserQuestions(fallbackQuestions);
  };

  const handleTimeOut = () => {
    if (selectedAnswer !== null) return;
    playSound("buzz");
    setAnswerState("incorrect");
    setGuesserStreak(0);
    const currentQ = guesserQuestions[currentQuestionIndex];
    const correctAns = currentQ ? currentQ.answer : "";
    setCorrectOption(correctAns);
    setSelectedAnswer("TIMEOUT_EXPIRED");

    const nextLives = guesserLives - 1;
    setGuesserLives(nextLives);
  };

  const handleAnswerClick = (option: string) => {
    if (selectedAnswer !== null || gameOver || gameWon) return;

    setSelectedAnswer(option);
    const currentQ = guesserQuestions[currentQuestionIndex];
    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      playSound("ding");
      setAnswerState("correct");
      const nextStreak = guesserStreak + 1;
      setGuesserStreak(nextStreak);

      let points = 10;
      if (nextStreak > 0 && nextStreak % 3 === 0) {
        points += 20;
        triggerEffect("BONUS +20! 🔥", 50, 40);
      } else {
        triggerEffect("+10 ✨", 50, 40);
      }
      setScore((prev) => prev + points);
    } else {
      playSound("buzz");
      setAnswerState("incorrect");
      setGuesserStreak(0);
      setCorrectOption(currentQ.answer);

      const nextLives = guesserLives - 1;
      setGuesserLives(nextLives);
      triggerEffect("❌ БУРУУ!", 50, 40);
    }
  };

  const handleNextClick = () => {
    if (guesserLives <= 0) {
      setGameOver(true);
      updateHighScore("guesser", score);
    } else {
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    setSelectedAnswer(null);
    setAnswerState(null);
    setCorrectOption(null);
    
    if (currentQuestionIndex + 1 < guesserQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setGameWon(true);
      updateHighScore("guesser", score);
    }
  };

  useEffect(() => {
    if (activeGame !== "guesser" || !gameStarted || gameOver || gameWon) {
      if (guesserTimerRef.current) clearInterval(guesserTimerRef.current);
      return;
    }

    if (selectedAnswer !== null) {
      if (guesserTimerRef.current) clearInterval(guesserTimerRef.current);
      return;
    }

    setGuesserTimeLeft(15);
    guesserTimerRef.current = setInterval(() => {
      setGuesserTimeLeft((prev) => {
        if (prev <= 1) {
          if (guesserTimerRef.current) clearInterval(guesserTimerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (guesserTimerRef.current) clearInterval(guesserTimerRef.current);
    };
  }, [activeGame, gameStarted, gameOver, gameWon, currentQuestionIndex, selectedAnswer, guesserQuestions]);

  // Auto-advance after answering in Anime Guesser
  useEffect(() => {
    if (activeGame !== "guesser" || !gameStarted || gameOver || gameWon || selectedAnswer === null) {
      return;
    }

    const timer = setTimeout(() => {
      if (guesserLives <= 0) {
        setGameOver(true);
        updateHighScore("guesser", score);
      } else {
        moveToNextQuestion();
      }
    }, 2800); // 2.8 seconds to see the result and image

    return () => clearTimeout(timer);
  }, [selectedAnswer, guesserLives, score, activeGame, gameStarted, gameOver, gameWon]);

  const handleBackToMenu = () => {
    setActiveGame("select");
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    setScore(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (guesserTimerRef.current) clearInterval(guesserTimerRef.current);
  };

  return (
    <section id="game" className="py-24 sm:py-32 relative z-10 px-6 sm:px-8 border-t border-white/5 bg-background/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Header section (shows only when not playing a sub-game) */}
        {activeGame === "select" && (
          <div className="text-center space-y-4 mb-16 animate-fade-rise">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block">
              Интерактив Тоглоомын Төв
            </span>
            <h2 
              className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
              style={{ fontFamily: "'Instrument Serif', serif" }}
              id="game-title"
            >
              Баяржаргалын <em className="not-italic text-neutral-400">Бүтээлч Аркад</em>
            </h2>
            <p className="text-neutral-400 text-sm max-w-lg mx-auto font-light leading-relaxed">
              Дуртай тоглоомоо сонгож өөрийгөө сориод, шилдэг амжилтуудыг тогтоорой. Хурдан хэмнэлтэй Geometry Dash, хөгжим болон ой тогтоолтын сорилтууд! ⚡
            </p>
          </div>
        )}

        {/* ==========================================
            GAME SELECT SCREEN
           ========================================== */}
        {activeGame === "select" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="arcade-mode-selection">
            
            {/* GEOMETRY DASH (NEW) */}
            <div className="liquid-glass rounded-3xl p-6 flex flex-col justify-between border border-white/5 hover:scale-[1.03] transition-all duration-300 bg-neutral-900/10 min-h-[300px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">1. Geometry Dash</h3>
                  <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                    Гялалзсан неон шоог удирдан саад тотгорууд дээгүүр яг зөв цагт нь үсэрч, барианы шугамд хүрээрэй!
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Дээд амжилт: <strong className="text-white font-medium">{highScores.geometry}%</strong></span>
                <button 
                  onClick={() => { setActiveGame("geometry"); startGeometry(); }}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Тоглох <ChevronLeft className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </div>

            {/* MXRNINGSTAR RHYTHM BEATS */}
            <div className="liquid-glass rounded-3xl p-6 flex flex-col justify-between border border-white/5 hover:scale-[1.03] transition-all duration-300 bg-neutral-900/10 min-h-[300px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Music className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">2. Хөгжмийн Хэмнэл</h3>
                  <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                    Mxrningstar-ын гүн хэмнэлээр унах ноотуудыг яг таг хугацаанд нь дарж оноо цуглуулж комбо үүсгээрэй!
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Дээд амжилт: <strong className="text-white font-medium">{highScores.rhythm}</strong></span>
                <button 
                  onClick={() => { setActiveGame("rhythm"); startRhythm(); }}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Тоглох <ChevronLeft className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </div>

            {/* MEMORY MATCH */}
            <div className="liquid-glass rounded-3xl p-6 flex flex-col justify-between border border-white/5 hover:scale-[1.03] transition-all duration-300 bg-neutral-900/10 min-h-[300px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">3. Ой Тогтоолт</h3>
                  <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                    Хамгийн цөөн нүүдлээр, хамгийн бага хугацаанд гялалзсан картуудыг хослуулж ой тогтоолтоо сориорой.
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Дээд амжилт: <strong className="text-white font-medium">{highScores.memory}</strong></span>
                <button 
                  onClick={() => { setActiveGame("memory"); initMemoryGame(); }}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Тоглох <ChevronLeft className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </div>

            {/* ANIME GUESSER */}
            <div className="liquid-glass rounded-3xl p-6 flex flex-col justify-between border border-white/5 hover:scale-[1.03] transition-all duration-300 bg-neutral-900/10 min-h-[300px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">4. Anime Guesser</h3>
                  <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                    Эможигоор илэрхийлсэн асуултыг харж, 15 секундийн дотор зөв анимэг тааж өөрийгөө сориорой! 🏆
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Дээд амжилт: <strong className="text-white font-medium">{highScores.guesser}</strong></span>
                <button 
                  onClick={() => { setActiveGame("guesser"); startGuesser(); }}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Тоглох <ChevronLeft className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            ACTIVE SUB-GAME CHANNELS
           ========================================== */}
        {activeGame !== "select" && (
          <div className="space-y-6">
            
            {/* Dashboard Header */}
            <div className="flex justify-between items-center bg-neutral-900/50 border border-white/5 px-6 py-4 rounded-2xl" id="active-game-header">
              <button 
                onClick={handleBackToMenu}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors font-medium cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Буцах
              </button>
 
              <div className="text-sm font-medium text-white uppercase tracking-wider font-sans text-center px-2">
                {activeGame === "geometry" && "1. Geometry Dash (Cube Run)"}
                {activeGame === "rhythm" && "2. Хөгжмийн Хэмнэл (Rhythm)"}
                {activeGame === "memory" && "3. Ой Тогтоолт"}
                {activeGame === "guesser" && "4. Anime Guesser (Эможи таавар)"}
              </div>
 
              <div className="flex gap-4 items-center">
                <div className="text-xs text-neutral-400">Оноо: <strong className="text-white text-sm font-semibold">{score}</strong></div>
                {activeGame === "geometry" && <div className="text-xs text-neutral-500 hidden sm:block">HS: {highScores.geometry}%</div>}
                {activeGame === "rhythm" && <div className="text-xs text-neutral-500 hidden sm:block">HS: {highScores.rhythm}</div>}
                {activeGame === "memory" && <div className="text-xs text-neutral-500 hidden sm:block">HS: {highScores.memory}</div>}
                {activeGame === "guesser" && <div className="text-xs text-neutral-500 hidden sm:block">HS: {highScores.guesser}</div>}
              </div>
            </div>

            {/* STAGE CANVAS */}
            <div 
              ref={containerRef}
              className="relative w-full h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-neutral-950/40 backdrop-blur-sm shadow-2xl flex items-center justify-center select-none"
              id="active-game-canvas-area"
            >
              {/* Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Dynamic hit float text effects */}
              {effectVisible && (
                <div 
                  style={{ left: `${effectX}%`, top: `${effectY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-white font-bold tracking-wider text-xs sm:text-sm scale-110 transition-all duration-300 pointer-events-none z-20"
                >
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-lg flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    {effectText}
                  </span>
                </div>
              )}

              {/* ----------------------------------------------------
                  SUB-GAME 1: GEOMETRY DASH INTERFACE
                 ---------------------------------------------------- */}
              {activeGame === "geometry" && (
                <div className="w-full h-full flex flex-col justify-between p-6 relative">
                  
                  {!gameStarted && !gameOver && !gameWon && (
                    <div className="m-auto text-center p-6 space-y-4 max-w-xs animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Geometry Dash</h3>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">
                        Дэлгэц дээр дарж эсвэл гарны <strong>SPACE / ArrowUp / W</strong> товчлуураар шоог үсэргэж саадуудыг даваарай. 100% болоход та ялна!
                      </p>
                      <button 
                        onClick={startGeometry}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Эхлүүлэх
                      </button>
                    </div>
                  )}

                  {gameStarted && !gameOver && !gameWon && (
                    <div 
                      onClick={triggerGeometryJump}
                      className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 cursor-pointer"
                    >
                      {/* Top Progress bar */}
                      <div className="flex justify-between items-center z-10 w-full bg-neutral-950/30 p-3 rounded-xl border border-white/5">
                        <div className="flex flex-col gap-1 w-2/3">
                          <div className="flex justify-between text-[10px] text-neutral-400">
                            <span>ТҮВШНИЙ БАРИА</span>
                            <span>{levelProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              style={{ width: `${levelProgress}%` }}
                              className="h-full bg-emerald-400 rounded-full transition-all duration-150"
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] tracking-wider text-neutral-400 block uppercase">ОНОО</span>
                          <span className="text-lg font-bold text-white font-mono">{score}</span>
                        </div>
                      </div>

                      {/* Main Running Stage Area */}
                      <div className="flex-1 w-full relative border-b border-emerald-500/30 overflow-hidden mb-6 mt-4">
                        
                        {/* Glow Ground Line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-[0_-4px_10px_rgba(16,185,129,0.5)]" />

                        {/* Player Neon Cube */}
                        <div
                          style={{ 
                            bottom: `${playerY}%`, 
                            left: "15%",
                            width: "6%",
                            height: "9%",
                          }}
                          className={`absolute rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-300 border-2 border-white shadow-[0_0_15px_rgba(52,211,153,0.6)] flex items-center justify-center transition-all duration-75 z-20 ${isJumping ? 'rotate-45' : 'animate-[pulse_1s_infinite]'}`}
                        >
                          <span className="text-xs">⚡</span>
                        </div>

                        {/* Obstacles (Spikes, Blocks) */}
                        {obstacles.map((obs) => (
                          <div
                            key={obs.id}
                            style={{
                              left: `${obs.x}%`,
                              bottom: "0px",
                              width: `${obs.width}%`,
                              height: `${obs.height}%`,
                            }}
                            className="absolute transition-all duration-75 z-10"
                          >
                            {obs.type === "spike" && (
                              <svg viewBox="0 0 100 100" className="w-full h-full fill-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                                <polygon points="50,0 100,100 0,100" stroke="#ffffff" strokeWidth="6" />
                              </svg>
                            )}

                            {obs.type === "double" && (
                              <div className="w-full h-full flex gap-1">
                                <svg viewBox="0 0 100 100" className="w-1/2 h-full fill-red-600 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                                  <polygon points="50,0 100,100 0,100" stroke="#ffffff" strokeWidth="6" />
                                </svg>
                                <svg viewBox="0 0 100 100" className="w-1/2 h-full fill-red-600 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                                  <polygon points="50,0 100,100 0,100" stroke="#ffffff" strokeWidth="6" />
                                </svg>
                              </div>
                            )}

                            {obs.type === "block" && (
                              <div className="w-full h-full bg-gradient-to-t from-red-600 to-orange-500 border-2 border-white rounded-md shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">☠</span>
                              </div>
                            )}
                          </div>
                        ))}

                      </div>

                      {/* Click indicator helper at bottom */}
                      <div className="text-center text-[10px] text-neutral-400 animate-pulse tracking-wider">
                        ДЭЛГЭЦ ДЭЭР ДАРЖ ҮСЭРНЭ ҮҮ (SPACEBAR)
                      </div>

                    </div>
                  )}

                  {/* GAME OVER Screen */}
                  {gameOver && (
                    <div className="m-auto text-center p-6 space-y-4 max-w-xs animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center mx-auto">
                        <RotateCcw className="w-6 h-6 text-red-400 animate-spin" />
                      </div>
                      <h3 className="text-xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Туулсан зам: {levelProgress}%</h3>
                      <p className="text-xs text-neutral-400 font-light">Сэтгэлээр бүү унаарай! Шоо унавал дахиад л эхэлнэ, дараагийн удаа илүү холдоорой.</p>
                      <button 
                        onClick={startGeometry}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Дахин эхлэх
                      </button>
                    </div>
                  )}

                  {/* GAME WON Screen */}
                  {gameWon && (
                    <div className="m-auto text-center p-6 space-y-4 max-w-xs animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-2xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>ЯЛАЛТ! 🎉 100%</h3>
                      <p className="text-xs text-neutral-400 font-light">Баяр хүргэе! Та Geometry Dash саадыг бүрэн туулж, ялалт байгууллаа. Гайхалтай хурд!</p>
                      <button 
                        onClick={startGeometry}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Дахин тоглох
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* ----------------------------------------------------
                  SUB-GAME 2: MXRNINGSTAR RHYTHM BEATS INTERFACE
                 ---------------------------------------------------- */}
              {activeGame === "rhythm" && (
                <div className="w-full h-full flex flex-col justify-between p-6">
                  
                  {!gameStarted && !gameOver && (
                    <div className="m-auto text-center p-6 space-y-4 max-w-xs animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <Music className="w-6 h-6 text-red-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Mxrningstar Хэмнэл</h3>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">
                        Унах ноотуудыг яг доорх байнд хүрэхэд нь хулганаар товшиж эсвэл гарнаас <strong>1, 2, 3</strong> эсвэл <strong>Arrow keys</strong> ашиглан дараарай!
                      </p>
                      <button 
                        onClick={startRhythm}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Эхлүүлэх
                      </button>
                    </div>
                  )}

                  {gameStarted && !gameOver && (
                    <div className="w-full h-full flex flex-col justify-between relative">
                      
                      {/* Top Health and Combo Bar */}
                      <div className="flex justify-between items-center z-10">
                        <div className="flex flex-col gap-1 w-1/2">
                          <div className="flex justify-between text-[10px] text-neutral-400">
                            <span>ЭРЧ ХҮЧ</span>
                            <span>{health}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              style={{ width: `${health}%` }}
                              className={`h-full rounded-full transition-all duration-150 ${health > 40 ? 'bg-red-500' : 'bg-red-700 animate-pulse'}`}
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] tracking-wider text-neutral-400 block uppercase font-medium">КОМБО</span>
                          <span className="text-2xl font-bold text-white animate-bounce tracking-tight font-mono">{combo} <span className="text-xs font-semibold text-red-400">x{multiplier}</span></span>
                        </div>
                      </div>

                      {/* Falling lanes area */}
                      <div className="flex-1 w-full grid grid-cols-3 relative mt-4 border-b border-white/10 bg-neutral-950/20 rounded-2xl overflow-hidden">
                        
                        {/* Lane separators */}
                        <div className="absolute inset-y-0 left-[33.3%] w-[1px] bg-white/5" />
                        <div className="absolute inset-y-0 left-[66.6%] w-[1px] bg-white/5" />

                        {/* Rhythm targets / Hit line at y: 85% */}
                        <div className="absolute left-0 right-0 bottom-12 h-[3px] bg-red-500/30 z-0 border-dashed border-t border-red-500/50" />

                        {/* Rendering Beats */}
                        {beats.map((beat) => (
                          <div
                            key={beat.id}
                            style={{ 
                              left: `${(beat.lane * 33.3) + 16.6}%`, 
                              top: `${beat.y}%`,
                              transform: "translate(-50%, -50%)" 
                            }}
                            className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10"
                          >
                            <span className="text-[9px] font-bold text-white uppercase">{beat.lane + 1}</span>
                          </div>
                        ))}

                      </div>

                      {/* Lane Buttons for Tap / Click controls */}
                      <div className="grid grid-cols-3 gap-3 mt-4 z-10">
                        {[0, 1, 2].map((laneIdx) => (
                          <button
                            key={laneIdx}
                            onClick={() => triggerHitLane(laneIdx)}
                            className="liquid-glass py-3.5 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer bg-neutral-900/30 hover:bg-neutral-900/50 text-white"
                          >
                            <span className="text-xs font-semibold uppercase tracking-wider">Гар {laneIdx + 1}</span>
                            <span className="text-[10px] text-neutral-500">
                              {laneIdx === 0 && "1 эсвэл ◀"}
                              {laneIdx === 1 && "2 эсвэл ▼"}
                              {laneIdx === 2 && "3 эсвэл ▶"}
                            </span>
                          </button>
                        ))}
                      </div>

                    </div>
                  )}

                  {gameOver && (
                    <div className="m-auto text-center p-6 space-y-4 max-w-xs animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center mx-auto">
                        <Music className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Эцсийн Оноо: {score}</h3>
                      <p className="text-xs text-neutral-400 font-light">Mxrningstar-ын гүн хэмнэл таныг хөглөж байна. Дахин тоглож оноогоо ахиулна уу!</p>
                      <button 
                        onClick={startRhythm}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Дахин эхлэх
                      </button>
                    </div>
                  )}

                </div>
              )}


              {/* ----------------------------------------------------
                  SUB-GAME 3: MEMORY MATCH PLAYGROUND
                 ---------------------------------------------------- */}
              {activeGame === "memory" && (
                <div className="w-full max-w-md px-6 flex flex-col items-center space-y-6">
                  
                  {!gameStarted && !gameOver && (
                    <div className="text-center p-6 space-y-4 max-w-xs animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Картуудын хосыг ол!</h3>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">
                        Гялалзсан картуудыг даран эргүүлж хосыг нь олж цэвэрлээрэй. Ой тогтоолтын хурдаа шалга!
                      </p>
                      <button 
                        onClick={initMemoryGame}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Эхлүүлэх
                      </button>
                    </div>
                  )}

                  {gameStarted && (
                    <div className="w-full space-y-6 animate-fade-rise">
                      
                      <div className="flex justify-between items-center text-xs text-neutral-400">
                        <div className="flex items-center gap-1.5 bg-neutral-900/60 border border-white/5 px-3 py-1.5 rounded-lg">
                          <Timer className="w-3.5 h-3.5" />
                          Хугацаа: <span className="text-white font-medium">{memoryTime}с</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-900/60 border border-white/5 px-3 py-1.5 rounded-lg">
                          <Smile className="w-3.5 h-3.5" />
                          Нүүдэл: <span className="text-white font-medium">{memoryMoves}</span>
                        </div>
                      </div>

                      {!gameOver && (
                        <div className="grid grid-cols-4 gap-3">
                          {cards.map((card, idx) => (
                            <button
                              key={card.id}
                              onClick={() => handleCardClick(idx)}
                              className={`aspect-square rounded-xl border flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer ${
                                card.isFlipped || card.isMatched
                                  ? "bg-white/10 border-white/20 rotate-180"
                                  : "bg-neutral-950/60 border-white/5 hover:border-white/20 hover:bg-neutral-900"
                              }`}
                            >
                              {(card.isFlipped || card.isMatched) ? (
                                <div className="rotate-180">{card.icon}</div>
                              ) : (
                                <div className="text-neutral-600 font-bold text-lg select-none">🎮</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {gameOver && (
                        <div className="text-center p-6 space-y-4 max-w-xs mx-auto animate-fade-rise">
                          <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-medium text-white">Гайхалтай Ялалт! 🎉</h3>
                            <p className="text-xs text-neutral-400 font-light leading-relaxed">
                              Та бүх хосыг {memoryTime} секундэд, {memoryMoves} нүүдлээр олж дуусгалаа.
                            </p>
                            <p className="text-sm font-semibold text-emerald-400 mt-2">Эцсийн Оноо: {score}</p>
                          </div>
                          <button 
                            onClick={initMemoryGame}
                            className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] transition-transform cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Дахин тоглох
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* ----------------------------------------------------
                  SUB-GAME 4: ANIME GUESSER PLAYGROUND
                 ---------------------------------------------------- */}
              {activeGame === "guesser" && (
                <div className="w-full max-w-xl px-6 flex flex-col items-center justify-center min-h-[400px]">
                  
                  {!gameStarted && !gameOver && !gameWon && (
                    <div className="text-center p-6 space-y-4 max-w-sm animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-purple-950/40 border border-purple-500/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Anime Guesser! 🧩</h3>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">
                        Эможи таавраар хамгийн алдартай анимэнуудыг тааж өөрийгөө сориорой.
                      </p>
                      <ul className="text-[11px] text-neutral-500 space-y-1 text-left list-disc list-inside max-w-xs mx-auto">
                        <li>Зөв хариулбал +10 оноо</li>
                        <li>Асуулт бүрт 15 секундын хугацаатай</li>
                        <li>3 амьтай, 3 удаа буруу бол дуусна</li>
                        <li>Дараалан 3 зөв хариулбал +20 бонус оноо!</li>
                      </ul>
                      <button 
                        onClick={startGuesser}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Эхлүүлэх
                      </button>
                    </div>
                  )}

                  {gameStarted && !gameOver && !gameWon && (
                    <div className="w-full space-y-6 animate-fade-rise" key={currentQuestionIndex}>
                      
                      {/* Timer & Lives Dashboard */}
                      <div className="flex justify-between items-center text-xs text-neutral-400 bg-neutral-900/60 border border-white/5 p-3 rounded-2xl w-full">
                        {/* Time Left */}
                        <div className="flex items-center gap-1.5">
                          <Timer className={`w-4 h-4 ${guesserTimeLeft <= 5 ? "text-red-500 animate-pulse" : "text-purple-400"}`} />
                          <span>Хугацаа: </span>
                          <span className={`font-semibold text-sm ${guesserTimeLeft <= 5 ? "text-red-400" : "text-white"}`}>
                            {guesserTimeLeft}с
                          </span>
                        </div>

                        {/* Streak */}
                        {guesserStreak > 0 && (
                          <div className="flex items-center gap-1 bg-purple-900/40 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] text-purple-300 animate-bounce">
                            <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                            <span>{guesserStreak} дараалсан!</span>
                          </div>
                        )}

                        {/* Lives */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500">Амь:</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Heart 
                                key={i} 
                                className={`w-4 h-4 transition-all duration-300 ${
                                  i < guesserLives 
                                    ? "text-red-500 fill-red-500 scale-100" 
                                    : "text-neutral-800 scale-75"
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Question Container */}
                      {guesserQuestions[currentQuestionIndex] && (
                        <div className="space-y-6 w-full">
                          <div className="text-center space-y-3 bg-neutral-900/30 border border-white/5 py-6 px-4 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-2 right-3 text-[10px] text-neutral-500 font-mono">
                              Асуулт {currentQuestionIndex + 1} / {guesserQuestions.length}
                            </div>
                            
                            {selectedAnswer === null ? (
                              <>
                                <div className="text-4xl sm:text-5xl tracking-widest select-none drop-shadow-lg filter py-4 animate-pulse">
                                  {guesserQuestions[currentQuestionIndex].emojis}
                                </div>
                                <div className="text-xs text-neutral-400 font-light">
                                  Энэ ямар анимэ вэ? 🤔
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center space-y-3 animate-fade-rise py-1">
                                <div className="text-2xl sm:text-3xl tracking-widest opacity-60">
                                  {guesserQuestions[currentQuestionIndex].emojis}
                                </div>
                                
                                {guesserQuestions[currentQuestionIndex].image && (
                                  <div className="flex justify-center my-1 animate-fade-rise">
                                    <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg w-28 h-28 sm:w-32 sm:h-32">
                                      <img 
                                        src={guesserQuestions[currentQuestionIndex].image} 
                                        alt={guesserQuestions[currentQuestionIndex].answer} 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <div className="space-y-1">
                                  {answerState === "correct" ? (
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm justify-center">
                                      <Sparkles className="w-4 h-4 animate-pulse" />
                                      <span>Зөв хариуллаа! 🎉</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-red-400 font-semibold text-sm justify-center">
                                      <span>Буруу хариуллаа! 😢</span>
                                    </div>
                                  )}
                                  <p className="text-xs text-neutral-300">
                                    Анимэ: <strong className="text-white font-semibold text-sm">{guesserQuestions[currentQuestionIndex].answer}</strong>
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {guesserQuestions[currentQuestionIndex].options.map((option: string) => {
                              const isSelected = selectedAnswer === option;
                              const isCorrect = option === guesserQuestions[currentQuestionIndex].answer;
                              const isWrong = isSelected && !isCorrect;
                              
                              // Classes based on state
                              let btnClass = "bg-neutral-900/50 border-white/5 hover:border-purple-500/30 hover:bg-purple-950/10 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] text-white";
                              
                              if (selectedAnswer !== null) {
                                if (isCorrect) {
                                  btnClass = "bg-emerald-900/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]";
                                } else if (isWrong) {
                                  btnClass = "bg-red-900/40 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake scale-[0.98]";
                                } else {
                                  btnClass = "bg-neutral-950/20 border-white/5 text-neutral-600 opacity-50";
                                }
                              }

                              return (
                                <button
                                  key={option}
                                  onClick={() => handleAnswerClick(option)}
                                  disabled={selectedAnswer !== null}
                                  className={`py-3.5 px-5 rounded-2xl border text-sm font-medium transition-all duration-300 cursor-pointer flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{option}</span>
                                  {selectedAnswer !== null && isCorrect && (
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Auto-advance notification */}
                          {selectedAnswer !== null && (
                            <div className="space-y-4 pt-1 animate-fade-rise">
                              <div className="text-center text-[11px] text-neutral-500 font-light flex items-center justify-center gap-2 py-1">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                                <span>Дараагийн асуулт ачаалж байна...</span>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  )}

                  {/* Game Over Screen */}
                  {gameOver && (
                    <div className="text-center p-6 space-y-5 max-w-sm mx-auto animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center mx-auto">
                        <Flame className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-medium text-white">Тоглоом дууслаа! 💔</h3>
                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                          Амь дууссан тул тоглоом зогслоо. Та сорилыг амжилттай дуусгаж чадсангүй.
                        </p>
                        <p className="text-lg font-semibold text-purple-400 mt-2">Цуглуулсан оноо: {score}</p>
                        {score >= highScores.guesser && score > 0 && (
                          <p className="text-[10px] uppercase tracking-widest text-yellow-400 font-semibold animate-pulse">
                            🎉 Шинэ дээд амжилт!
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={startGuesser}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Дахин эхлүүлэх
                      </button>
                    </div>
                  )}

                  {/* Game Won Screen */}
                  {gameWon && (
                    <div className="text-center p-6 space-y-5 max-w-sm mx-auto animate-fade-rise">
                      <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6 text-emerald-400 animate-bounce" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-medium text-emerald-400">Сорилыг яллаа! 🎉</h3>
                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                          Баяр хүргэе! Та бүх асуултад амжилттай хариулж, аниме таавар тоглоомыг дуусгалаа.
                        </p>
                        <p className="text-lg font-semibold text-emerald-400 mt-2 font-mono">Нийт Оноо: {score}</p>
                        {score >= highScores.guesser && score > 0 && (
                          <p className="text-[10px] uppercase tracking-widest text-yellow-400 font-semibold animate-pulse">
                            🏆 Шинэ дээд амжилт!
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={startGuesser}
                        className="liquid-glass w-full rounded-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-white hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Дахин тоглох
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
