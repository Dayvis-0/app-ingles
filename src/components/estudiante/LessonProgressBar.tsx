import { ArrowLeft, Check } from "lucide-react";
import { ETAPAS_LECCION } from "./etapas";

interface LessonProgressBarProps {
  currentStepIndex: number;
  lessonTitle: string;
  onSelectStep: (index: number) => void;
  onBackToMenu: () => void;
}

export default function LessonProgressBar({
  currentStepIndex,
  lessonTitle,
  onSelectStep,
  onBackToMenu,
}: LessonProgressBarProps) {
  const totalSteps = ETAPAS_LECCION.length;
  const safeIndex = Math.max(0, Math.min(currentStepIndex, totalSteps - 1));
  const currentStep = ETAPAS_LECCION[safeIndex];
  const progressPercent = Math.round(((safeIndex + 1) / totalSteps) * 100);

  return (
    <header className="sticky top-0 z-20 bg-white border-b-2 border-slate-200 shadow-xs">
      <div className="max-w-5xl w-full mx-auto px-3 py-3 md:px-8 space-y-2.5">
        {/* Top bar: back button, lesson title, "Etapa X de 5" indicator & percentage */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBackToMenu}
              aria-label="Volver a mis lecciones"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs md:text-sm font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <div className="min-w-0">
              <p
                className="text-xs md:text-sm font-black text-slate-800 truncate"
                title={lessonTitle}
              >
                {lessonTitle}
              </p>
              <p className="text-[11px] font-bold text-[#1cb0f6] sm:hidden truncate">
                {currentStep.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-sky-100 text-[#1cb0f6] font-black text-xs md:text-sm px-3 py-1 rounded-full">
              Etapa {safeIndex + 1} de {totalSteps}
            </span>
            <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2.5 py-1 rounded-full">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Continuous progress bar (always visible on mobile & desktop) */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de la lección: Etapa ${safeIndex + 1} de ${totalSteps}`}
          className="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-[#58cc02] to-[#46a302] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 5-step interactive stepper */}
        <nav aria-label="Etapas de la lección" className="grid grid-cols-5 gap-1.5 pt-1">
          {ETAPAS_LECCION.map((step, i) => {
            const isCompleted = i < safeIndex;
            const isActive = i === safeIndex;

            return (
              <button
                key={step.key}
                type="button"
                onClick={() => onSelectStep(i)}
                aria-current={isActive ? "step" : undefined}
                title={`Etapa ${step.number}: ${step.label}`}
                className={`flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl border-2 text-[11px] md:text-xs font-extrabold transition-all cursor-pointer truncate ${
                  isActive
                    ? "bg-sky-50 border-[#1cb0f6] text-[#1cb0f6] shadow-xs"
                    : isCompleted
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100/70"
                      : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                }`}
              >
                <span
                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isActive
                      ? "bg-[#1cb0f6] text-white"
                      : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3px]" /> : step.number}
                </span>
                <span className="truncate md:hidden">{step.shortLabel}</span>
                <span className="truncate hidden md:inline">{step.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
