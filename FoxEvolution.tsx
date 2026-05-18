import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { Stage1Egg } from "./fox-stages/Stage1Egg";
import { Stage2CrackingEgg } from "./fox-stages/Stage2CrackingEgg";
import { Stage3BabyFox } from "./fox-stages/Stage3BabyFox";
import { Stage4Apprentice } from "./fox-stages/Stage4Apprentice";
import { Stage5Studious } from "./fox-stages/Stage5Studious";
import { Stage6Strategic } from "./fox-stages/Stage6Strategic";
import { Stage7Advanced } from "./fox-stages/Stage7Advanced";
import { Stage8Master } from "./fox-stages/Stage8Master";
import { LevelUpPopup } from "./LevelUpPopup";
import { Flame, Star, BookOpen, ChevronRight, Award, Trophy, Sparkles } from "lucide-react";
import { STAGES } from "../lib/progression/config";
import { evaluateProgression } from "../lib/progression/engine";
import { usePet } from "../contexts/PetContext";

export interface FoxStageProps {
  progress: number;
  emotion: 'idle' | 'focused' | 'happy' | 'tired' | 'excited' | 'proud' | 'curious' | 'celebrating' | 'inspired';
  milestones: {
    hasAura: boolean;
    hasBooks: boolean;
    hasRunes: boolean;
    hasCrown: boolean;
    hasCosmic: boolean;
  };
}

const STAGE_COMPONENTS: Record<number, React.FC<FoxStageProps>> = {
  1: Stage1Egg,
  2: Stage2CrackingEgg,
  3: Stage3BabyFox,
  4: Stage4Apprentice,
  5: Stage5Studious,
  6: Stage6Strategic,
  7: Stage7Advanced,
  8: Stage8Master,
};

export function FoxEvolution() {
  const { stats, setStats, concluirSessaoDeEstudo, ganharXp } = usePet();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showXpGain, setShowXpGain] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [lastStageId, setLastStageId] = useState<number>(1);

  const progression = evaluateProgression(stats);
  const CurrentStageComponent = STAGE_COMPONENTS[progression.currentStage.id] || Stage1Egg;
  
  const currentStageIndex = STAGES.findIndex(s => s.id === progression.currentStage.id);
  const nextStage = STAGES[currentStageIndex + 1] || STAGES[currentStageIndex];

  // Monitor level up
  useEffect(() => {
    if (progression.currentStage.id !== lastStageId) {
      if (progression.currentStage.id > lastStageId) {
        setShowLevelUp(true);
        setStats(prev => ({ ...prev, justLeveledUp: true }));
        
        // Auto-hide popup after 6 seconds
        const timer = setTimeout(() => {
          setShowLevelUp(false);
          setStats(prev => ({ ...prev, justLeveledUp: false }));
        }, 6000);
      }
      setLastStageId(progression.currentStage.id);
    }
  }, [progression.currentStage.id, lastStageId]);

  const handleStudySession = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newGain = { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top, text: "+100 Pontos" };
    setShowXpGain((prev) => [...prev, newGain]);

    setTimeout(() => {
      setShowXpGain((prev) => prev.filter((p) => p.id !== newGain.id));
    }, 1000);

    setStats(prev => ({ ...prev, isStudying: true }));
    setTimeout(() => {
      // Usa a função do contexto! (simulamos 1 hora e 100xp)
      concluirSessaoDeEstudo(1, 100);
      
      // Update the local internal states just for the visual effect
      setStats(prev => ({
        ...prev,
        isStudying: false,
        ...(Math.random() > 0.5 && prev.currentStreak !== undefined ? { 
          currentStreak: prev.currentStreak + 1, 
          longestStreak: Math.max(prev.longestStreak || 0, prev.currentStreak + 1) 
        } : {})
      }));
    }, 600);
  };


  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto py-8 px-4">
      {/* Top Bar: Streak & Goal */}
      <div className="flex w-full items-center justify-between bg-white rounded-2xl p-4 shadow-[0_2px_15px_rgba(30,27,75,0.05)] border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Ofensiva de Estudo</p>
            <p className="text-xl font-bold text-slate-800">{stats.currentStreak} dias</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-sm font-semibold text-slate-500">Meta Diária</p>
            <p className="text-xl font-bold text-slate-800">{Math.floor(stats.hoursStudied)}h</p>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-500">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Hero Section: The Fox Companion */}
      <div className="relative w-full flex flex-col items-center bg-white rounded-3xl p-8 shadow-[0_10px_40px_rgba(30,27,75,0.08)] border border-slate-50 overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-3/4 h-3/4 bg-orange-100/50 rounded-full blur-3xl opacity-50"
          />
        </div>

        <div className="relative z-10 text-center mb-6">
          <motion.div
            key={progression.currentStage.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-bold tracking-wide mb-3"
          >
            <Award className="w-4 h-4" />
            Nível {progression.currentStage.id}
          </motion.div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {progression.currentStage.name}
          </h2>
          <p className="text-slate-500 font-medium">{progression.currentStage.description}</p>
        </div>

        <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-square flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={progression.currentStage.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full relative z-10"
            >
              <CurrentStageComponent 
                progress={progression.stageProgressPercentage} 
                emotion={progression.emotion} 
                milestones={progression.microProgression.unlocks} 
              />
            </motion.div>
          </AnimatePresence>

          {/* Level Up Celebration */}
          <LevelUpPopup show={showLevelUp} stageId={progression.currentStage.id} />
        </div>

        {/* XP & Progress Section */}
        <div className="w-full max-w-md mx-auto space-y-3 z-10">
          <div className="flex justify-between items-end text-sm font-bold">
            <span className="text-slate-600">{progression.score} Pontos</span>
            {progression.currentStage.id !== STAGES[STAGES.length - 1].id && (
              <span className="text-slate-400 font-medium">Próximo: {nextStage.minScore}</span>
            )}
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${progression.stageProgressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          {progression.currentStage.id === STAGES[STAGES.length - 1].id && (
            <p className="text-center text-sm font-bold text-orange-500 pt-2">
              Você alcançou o grau de excelência máxima!
            </p>
          )}
        </div>
      </div>

      {/* Actions (Simulating study sessions) */}
      <div className="w-full flex-col sm:flex-row flex gap-4 mt-2">
        <button
          onClick={handleStudySession}
          disabled={stats.isStudying || progression.currentStage.id === STAGES[STAGES.length - 1].id}
          className="flex-1 group relative flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:active:scale-100"
        >
          <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Concluir Sessão (+100 Pontos)
        </button>

        {/* Debug/Showcase buttons for fast-foward (Not for real prod app, but good for preview) */}
        <div className="flex gap-2">
          <button 
            onClick={() => setStats(prev => ({ ...prev, totalXp: Math.max(0, prev.totalXp - 500) }))}
            className="px-4 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
            title="- 500 XP"
          >
            -
          </button>
          <button 
            onClick={() => setStats(prev => ({ ...prev, totalXp: prev.totalXp + 500 }))}
            className="px-4 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
            title="+ 500 XP"
          >
            +
          </button>
        </div>
      </div>

      {/* Floating floating XP gains */}
      <AnimatePresence>
        {showXpGain.map((gain) => (
          <motion.div
            key={gain.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed text-2xl font-black text-amber-500 drop-shadow-md z-50 pointer-events-none"
            style={{ left: gain.x - 30, top: gain.y }}
          >
            {gain.text}
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
}

