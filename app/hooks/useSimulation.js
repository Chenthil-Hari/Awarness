'use client';

import { useState, useCallback } from 'react';

export function useSimulation(scenario) {
  const [currentStepId, setCurrentStepId] = useState('start');
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);

  const currentStep = scenario.steps[currentStepId];

  const makeDecision = useCallback((option) => {
    if (isComplete) return;

    setScore((prev) => prev + (option.points || 0));
    setLastFeedback(option.feedback);
    setHistory((prev) => [...prev, { step: currentStepId, choice: option.text }]);

    const nextStepId = option.nextStep;
    setCurrentStepId(nextStepId);

    if (scenario.steps[nextStepId].isFinal) {
      setIsComplete(true);
    }
  }, [currentStepId, isComplete, scenario.steps]);

  const reset = useCallback(() => {
    setCurrentStepId('start');
    setHistory([]);
    setScore(0);
    setIsComplete(false);
    setLastFeedback(null);
  }, []);

  return {
    currentStep,
    score,
    isComplete,
    lastFeedback,
    history,
    makeDecision,
    reset
  };
}
