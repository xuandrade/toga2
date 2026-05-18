import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserStats } from '../lib/progression/types';
import { evaluateProgression } from '../lib/progression/engine';

// Aqui definimos tudo o que o seu app inteiro vai poder acessar sobre o pet
interface PetContextData {
  stats: UserStats;
  // Use essa função para substituir os stats inteiros caso venham do Firebase/Backend
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  
  // Funções facilitadoras que você pode chamar em qualquer lugar do seu app
  ganharXp: (quantidade: number) => void;
  concluirSessaoDeEstudo: (horas: number, xpGanho: number) => void;
  concluirMetaSemanal: () => void;
}

const PetContext = createContext<PetContextData | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
  // Esse estado simula o que você puxaria do banco de dados do usuário real
  const [stats, setStats] = useState<UserStats>({
    totalXp: 800,
    studyDays: 5,
    hoursStudied: 12,
    weeklyGoalsCompleted: 0,
    isStudying: false,
    justLeveledUp: false,
  });

  // ========== FUNÇÕES PRONTAS PARA VOCÊ USAR NO SEU APP ========== //

  // Chame essa função nos botões que geram pontos (ex: responder questão)
  const ganharXp = (quantidade: number) => {
    setStats((prev) => ({
      ...prev,
      totalXp: prev.totalXp + quantidade
    }));
  };

  // Chame essa função quando usar o cronômetro do seu app e finalizar um ciclo
  const concluirSessaoDeEstudo = (horas: number, xpGanho: number) => {
    setStats((prev) => ({
      ...prev,
      totalXp: prev.totalXp + xpGanho,
      hoursStudied: prev.hoursStudied + horas,
      studyDays: prev.studyDays + 1, // lógica simplificada, você pode melhorar para não contar 2x no mesmo dia
    }));
  };

  // Chame essa função caso ele bata a meta semanal
  const concluirMetaSemanal = () => {
    setStats((prev) => ({
      ...prev,
      weeklyGoalsCompleted: prev.weeklyGoalsCompleted + 1,
    }));
  };

  return (
    <PetContext.Provider value={{
      stats,
      setStats,
      ganharXp,
      concluirSessaoDeEstudo,
      concluirMetaSemanal
    }}>
      {children}
    </PetContext.Provider>
  );
}

// Hook personalizado para você usar: const { ganharXp, stats } = usePet();
export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet deve ser usado dentro de um PetProvider');
  }
  return context;
}
