import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Import Stage 1 default export (the App component)
import Stage1App from '../stage 1 idea lab/idea-lab_-project-charter/App';

// Import Stage 2 AppContent component (for combined usage)
import { AppContent as Stage2AppContent } from '../stage 2 idea simulation/App';

// Types for data passed between stages
export interface Stage1Output {
  mission_name: string;
  project_sentence: string;
}

export interface Stage2InitialBrief {
  title: string;
  description: string;
}

/**
 * CombinedApp - Unified entry point for both stages
 * 
 * Flow:
 * 1. User completes Stage 1 (Idea Lab) → generates a ProjectCharter
 * 2. User clicks "进入灵感模拟" → Stage 1 output is mapped to Stage 2 input
 * 3. Stage 2 (Idea Simulation) starts with pre-filled title & description
 */
const CombinedApp: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<1 | 2>(1);
  const [stage1Output, setStage1Output] = useState<Stage1Output | null>(null);

  // Handler when Stage 1 completes
  const handleStage1Complete = (output: Stage1Output) => {
    console.log('📦 Stage 1 completed:', output);
    setStage1Output(output);
    setCurrentStage(2);
  };

  // Handler to go back to Stage 1
  const handleBackToStage1 = () => {
    setCurrentStage(1);
  };

  // Render Stage 1
  if (currentStage === 1) {
    return (
      <div className="stage-enter">
        <Stage1App onComplete={handleStage1Complete} />
      </div>
    );
  }

  // Render Stage 2 with pre-filled data from Stage 1
  const initialBrief: Stage2InitialBrief | undefined = stage1Output 
    ? {
        title: stage1Output.mission_name,
        description: stage1Output.project_sentence
      }
    : undefined;

  return (
    <div className="stage-enter">
      <ReactFlowProvider>
        <Stage2AppContent 
          initialBrief={initialBrief} 
          onBack={handleBackToStage1}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default CombinedApp;

