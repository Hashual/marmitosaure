import { useState } from "react";
import type { KeyboardEvent } from "react";

interface StepsListProps {
  steps: string[];
  onStepsChange: (steps: string[]) => void;
}

export default function StepsList({ steps, onStepsChange }: StepsListProps) {
  const [stepInput, setStepInput] = useState("");

  const handleAddStep = () => {
    if (stepInput.trim()) {
      onStepsChange([...steps, stepInput.trim()]);
      setStepInput("");
    }
  };

  const handleStepKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStep();
    }
  };

  const handleRemoveStep = (index: number) => {
    onStepsChange(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-gray-600 font-medium mb-4">Étapes de préparation:</h3>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-gray-50 px-3 py-2.5 rounded"
          >
            <span className="text-sm font-semibold text-teal-500 mt-0.5">
              {index + 1}.
            </span>
            <span className="text-sm text-gray-700 flex-1">{step}</span>
            <button
              type="button"
              onClick={() => handleRemoveStep(index)}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            onKeyPress={handleStepKeyPress}
            placeholder="Ajouter une étape..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-teal-400"
          />
          <button
            type="button"
            onClick={handleAddStep}
            className="px-4 py-2 bg-teal-400 text-white rounded hover:bg-teal-500 transition-colors text-sm font-medium"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
