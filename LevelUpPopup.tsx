import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Award, Zap, Crown, Flame, BookOpen } from 'lucide-react';

interface LevelUpPopupProps {
  show: boolean;
  stageId: number;
}

const LEVEL_UP_DATA: Record<number, { title: string; subtitle: string; icon: React.ElementType; color: string; animation: any }> = {
  2: {
    title: "A Casca Rachou!",
    subtitle: "A procrastinação foi vencida. Algo mágico está acordando graças à sua constância inicial.",
    icon: Zap,
    color: "rgba(234, 179, 8, 0.6)", // yellow-500
    animation: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
  },
  3: {
    title: "Faísca da Curiosidade!",
    subtitle: "Olha só! O filhote nasceu. Sua dedicação diária está começando a tomar forma.",
    icon: Sparkles,
    color: "rgba(168, 85, 247, 0.6)", // purple-500
    animation: { scale: [1, 1.1, 1], y: [0, -5, 0] }
  },
  4: {
    title: "O Foco do Aprendiz!",
    subtitle: "A vontade já superou o cansaço. Vocês estão criando uma disciplina de ferro!",
    icon: BookOpen,
    color: "rgba(20, 184, 166, 0.6)", // teal-500
    animation: { scale: [0.9, 1.1, 1] }
  },
  5: {
    title: "Mentalidade de Filósofa",
    subtitle: "Estudar já não é um fardo, tornou-se o seu estilo de vida. A consistência é sua maior arma.",
    icon: Flame,
    color: "rgba(244, 63, 94, 0.6)", // rose-500
    animation: { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
  },
  6: {
    title: "A Magia da Estratégia",
    subtitle: "Alto rendimento alcançado. Você e sua raposa agora dominam a arte das revisões e táticas.",
    icon: Sparkles,
    color: "rgba(14, 165, 233, 0.6)", // sky-500
    animation: { rotate: 360 }
  },
  7: {
    title: "A Nobreza do Conhecimento",
    subtitle: "Que presença majestosa. Sua capacidade amedronta qualquer banca examinadora.",
    icon: Crown,
    color: "rgba(217, 119, 6, 0.6)", // amber-600
    animation: { scale: [1, 1.1, 1], y: [0, -10, 0] }
  },
  8: {
    title: "A Lenda Viva!",
    subtitle: "Apoteose completa! Guardiã astral do conhecimento. O Olimpo dos estudantes é o seu lugar.",
    icon: Award,
    color: "rgba(139, 92, 246, 0.8)", // violet-500
    animation: { scale: [0.9, 1.2, 1], rotate: [0, -5, 5, 0] }
  }
};

export function LevelUpPopup({ show, stageId }: LevelUpPopupProps) {
  const data = LEVEL_UP_DATA[stageId];

  // If stageId is 1 (initial) or not found, we don't return anything or use a fallback.
  // Actually, level up to stage 1 doesn't happen usually, so we will only see > 1.
  if (!data) return null;

  const Icon = data.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none px-6"
        >
          {/* Neon White Glass Overlay */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />
          
          <div 
            className="relative bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center overflow-hidden border border-white/80"
            style={{ 
              boxShadow: `0 20px 50px -10px ${data.color}, 0 0 40px -10px ${data.color} inset, 0 0 0 1px rgba(255,255,255,0.5)` 
            }}
          >
            <motion.div 
              className="mx-auto w-24 h-24 mb-8 rounded-full flex items-center justify-center bg-white border-2 border-transparent"
              style={{ 
                boxShadow: `0 0 30px ${data.color}, inset 0 0 20px ${data.color}`,
                borderColor: data.color.replace('0.6', '1').replace('0.8', '1') // Make border solid version of color
              }}
              animate={data.animation}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon 
                className="w-12 h-12" 
                style={{ filter: `drop-shadow(0 0 8px ${data.color})` }}
                color={data.color.replace('0.6', '1').replace('0.8', '1')} 
              />
            </motion.div>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" style={{ filter: "drop-shadow(0 0 10px rgba(250,204,21,0.6))" }} />
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                {data.title}
              </h3>
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" style={{ animationDelay: "0.2s", filter: "drop-shadow(0 0 10px rgba(250,204,21,0.6))" }} />
            </div>
            
            <p className="text-slate-600 font-medium leading-relaxed text-lg">
              {data.subtitle}
            </p>

            <div className="mt-10">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                Novo estágio alcançado!
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
