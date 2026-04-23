'use client';

import { useState, useCallback } from 'react';

export function useSimulation(scenario) {
  const [currentStepId, setCurrentStepId] = useState('start');
  const [inventory, setInventory] = useState([]);

  const currentStep = scenario.steps[currentStepId];

  const makeDecision = useCallback((option) => {
    if (isComplete) return;

    // Handle Item Acquisition
    if (option.givesItem && !inventory.includes(option.givesItem)) {
      setInventory(prev => [...prev, option.givesItem]);
    }

    // Handle Item Requirements
    let nextStepId = option.nextStep;
    
    if (option.requiresItem && !inventory.includes(option.requiresItem)) {
      // If user lacks required item, redirect to a specific "missing item" step or fail
      nextStepId = option.failStep || currentStepId;
      setLastFeedback(`You need a ${option.requiresItem} to do this!`);
    } else {
      setScore((prev) => prev + (option.points || 0));
      setLastFeedback(option.feedback);
      setHistory((prev) => [...prev, { step: currentStepId, choice: option.text }]);
    }

    setCurrentStepId(nextStepId);

    if (scenario.steps[nextStepId].isFinal) {
      setIsComplete(true);
    }
  }, [currentStepId, isComplete, scenario.steps, inventory]);

  const reset = useCallback(() => {
    setCurrentStepId('start');
    setHistory([]);
    setScore(0);
    setInventory([]);
    setIsComplete(false);
    setLastFeedback(null);
  }, []);

  return {
    currentStep,
    score,
    inventory,
    isComplete,
    lastFeedback,
    history,
    makeDecision,
    reset
  };
}
