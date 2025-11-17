import { ProjectStage } from '@/types/database.types';

export type StagePhase = 'sales' | 'development' | 'payment' | 'completion';

export interface StageConfig {
  stage: ProjectStage;
  number: number;
  phase: StagePhase;
  phaseLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STAGE_CONFIGS: StageConfig[] = [
  // Initial Phase (1-3) - Gray
  {
    stage: 'დასაწყები',
    number: 1,
    phase: 'sales',
    phaseLabel: 'პირველადი',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    stage: 'მოხდა პირველი კავშირი',
    number: 2,
    phase: 'sales',
    phaseLabel: 'პირველადი',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    stage: 'ჩავნიშნეთ შეხვედრა',
    number: 3,
    phase: 'sales',
    phaseLabel: 'პირველადი',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  // Active Communication (4-5) - Blue
  {
    stage: 'შევხვდით და ველოდებით ინფორმაციას',
    number: 4,
    phase: 'sales',
    phaseLabel: 'აქტიური კომუნიკაცია',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    stage: 'მივიღეთ ინფორმაცია',
    number: 5,
    phase: 'sales',
    phaseLabel: 'აქტიური კომუნიკაცია',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  // Development Phase (6-11) - Green
  {
    stage: 'დავიწყეთ დეველოპემნტი',
    number: 6,
    phase: 'development',
    phaseLabel: 'დეველოპმენტი',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    stage: 'დავიწყეთ ტესტირება',
    number: 7,
    phase: 'development',
    phaseLabel: 'დეველოპმენტი',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    stage: 'გადავაგზავნეთ კლიენტთან',
    number: 8,
    phase: 'development',
    phaseLabel: 'დეველოპმენტი',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    stage: 'ველოდებით კლიენტისგან უკუკავშირს',
    number: 9,
    phase: 'development',
    phaseLabel: 'დეველოპმენტი',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    stage: 'დავიწყეთ კლიენტის ჩასწორებებზე მუშაობა',
    number: 10,
    phase: 'development',
    phaseLabel: 'დეველოპმენტი',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    stage: 'გავუგზავნეთ კლიენტს საბოლოო ვერსია',
    number: 11,
    phase: 'development',
    phaseLabel: 'დეველოპმენტი',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  // Approval Phase (12-13) - Yellow
  {
    stage: 'ველოდებით კლიენტის დასტურს',
    number: 12,
    phase: 'payment',
    phaseLabel: 'დასტური',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    stage: 'კლიენტმა დაგვიდასტურა',
    number: 13,
    phase: 'payment',
    phaseLabel: 'დასტური',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  // Payment Phase (14-16) - Orange
  {
    stage: 'კლიენტს გავუგზავნეთ პროექტის გადახდის დეტალები',
    number: 14,
    phase: 'payment',
    phaseLabel: 'გადახდა',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    stage: 'კლიენტისგან ველოდებით ჩარიცხვას',
    number: 15,
    phase: 'payment',
    phaseLabel: 'გადახდა',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    stage: 'კლიენტმა ჩარიცხა',
    number: 16,
    phase: 'payment',
    phaseLabel: 'გადახდა',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  // Final Phase (17-18) - Purple
  {
    stage: 'ვამატებთ პორტფოლიო პროექტებში',
    number: 17,
    phase: 'completion',
    phaseLabel: 'დასასრული',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    stage: 'პროექტი დასრულებულია',
    number: 18,
    phase: 'completion',
    phaseLabel: 'დასრულებული',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

// Helper functions
export const getStageConfig = (stage: ProjectStage): StageConfig | undefined => {
  return STAGE_CONFIGS.find((config) => config.stage === stage);
};

export const getStageByNumber = (number: number): StageConfig | undefined => {
  return STAGE_CONFIGS.find((config) => config.number === number);
};

export const getPhaseStages = (phase: StagePhase): StageConfig[] => {
  return STAGE_CONFIGS.filter((config) => config.phase === phase);
};

export const getNextStage = (currentStage: ProjectStage): StageConfig | null => {
  const currentConfig = getStageConfig(currentStage);
  if (!currentConfig || currentConfig.number >= 18) return null;
  return getStageByNumber(currentConfig.number + 1) || null;
};

export const getPreviousStage = (currentStage: ProjectStage): StageConfig | null => {
  const currentConfig = getStageConfig(currentStage);
  if (!currentConfig || currentConfig.number <= 1) return null;
  return getStageByNumber(currentConfig.number - 1) || null;
};

export const getPhaseProgress = (phase: StagePhase, currentStageNumber: number): number => {
  const phaseStages = getPhaseStages(phase);
  if (phaseStages.length === 0) return 0;

  const phaseMin = Math.min(...phaseStages.map(s => s.number));
  const phaseMax = Math.max(...phaseStages.map(s => s.number));

  if (currentStageNumber < phaseMin) return 0;
  if (currentStageNumber > phaseMax) return 100;

  return ((currentStageNumber - phaseMin + 1) / phaseStages.length) * 100;
};
