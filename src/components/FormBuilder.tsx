import React, { useState, useCallback, useRef } from "react";
import { useDrop, useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import type { Question, FormConfig, DragItem, QuestionType, Option, ConditionalLogic, Step } from "@/types/form";
import { Settings, Plus, Trash2, GripVertical, Copy, ChevronUp, ChevronDown, Edit2, X, Upload, Download } from "lucide-react";

interface FormBuilderProps {
  formConfig: FormConfig;
  onFormConfigChange: (config: FormConfig) => void;
}

const createDefaultQuestion = (type: QuestionType, id: string): Question => {
  const baseQuestion: Question = {
    id,
    type,
    title: `New ${type.replace("-", " ")} question`,
    description: "",
    required: false,
  };

  if (type === "single-choice" || type === "multiple-choice") {
    baseQuestion.options = [
      { id: `${id}-option-1`, label: "Option 1", value: "option1" },
      { id: `${id}-option-2`, label: "Option 2", value: "option2" },
    ];
  }

  return baseQuestion;
};

interface ConditionalLogicEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  availableQuestions: { id: string; title: string }[];
}

const ConditionalLogicEditor: React.FC<ConditionalLogicEditorProps> = ({ question, onUpdate, availableQuestions }) => {
  const addCondition = () => {
    const newCondition: ConditionalLogic = {
      questionId: "",
      condition: "equals",
      value: "",
    };
    const updatedLogic = [...(question.conditionalLogic || []), newCondition];
    onUpdate({ conditionalLogic: updatedLogic });
  };

  const updateCondition = (index: number, updates: Partial<ConditionalLogic>) => {
    const updatedLogic = [...(question.conditionalLogic || [])];
    updatedLogic[index] = { ...updatedLogic[index], ...updates };
    console.log("Updating condition:", index, updates, updatedLogic); // Debug log
    onUpdate({ conditionalLogic: updatedLogic });
  };

  const removeCondition = (index: number) => {
    const updatedLogic = [...(question.conditionalLogic || [])];
    updatedLogic.splice(index, 1);
    onUpdate({ conditionalLogic: updatedLogic });
  };

  // Get all available questions that could be referenced (questions that appear before this one)
  // For now, we'll use a simple placeholder - in a full implementation, you'd pass available questions as props

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Conditional Logic</Label>
        <Button variant="outline" size="sm" onClick={addCondition}>
          <Plus className="w-4 h-4 mr-1" />
          Add Condition
        </Button>
      </div>

      {question.conditionalLogic && question.conditionalLogic.length > 0 && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
          <div className="text-sm text-muted-foreground">Show this question only when:</div>
          {question.conditionalLogic.map((condition, index) => (
            <div key={index} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Question</Label>
                  <select value={condition.questionId} onChange={(e) => updateCondition(index, { questionId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select a question...</option>
                    {availableQuestions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Condition</Label>
                  <select
                    value={condition.condition}
                    onChange={(e) => updateCondition(index, { condition: e.target.value as ConditionalLogic["condition"] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="equals">equals</option>
                    <option value="not-equals">not equals</option>
                    <option value="contains">contains</option>
                    <option value="not-contains">not contains</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Value {condition.condition === "equals" || condition.condition === "not-equals" ? "(separate multiple values with commas)" : ""}</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={Array.isArray(condition.value) ? condition.value.join(", ") : condition.value || ""}
                      onChange={(e) => {
                        console.log("Input onChange triggered:", e.target.value); // Debug log
                        const inputValue = e.target.value.trim();

                        // For equals and not-equals conditions, support multiple values separated by commas
                        if ((condition.condition === "equals" || condition.condition === "not-equals") && inputValue.includes(",")) {
                          const values = inputValue
                            .split(",")
                            .map((v) => v.trim())
                            .filter((v) => v.length > 0);
                          updateCondition(index, { value: values.length > 1 ? values : inputValue });
                        } else {
                          updateCondition(index, { value: inputValue });
                        }
                      }}
                      placeholder={condition.condition === "equals" || condition.condition === "not-equals" ? "Enter values (e.g., 'glasses, contact-lense')..." : "Enter value (e.g., 'yes', 'no')..."}
                      className="flex-1 min-w-0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCondition(index)} className="h-10 w-10 text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {condition.condition === "equals" || condition.condition === "not-equals" ? <p className="text-xs text-muted-foreground mt-1">Tip: Use commas to separate multiple values for OR logic (e.g., "glasses, contact-lense")</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!question.conditionalLogic || question.conditionalLogic.length === 0) && (
        <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/20">This question will always be shown. Add conditions to show it only when specific answers are given.</div>
      )}
    </div>
  );
};

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  availableQuestions: { id: string; title: string }[];
  onMove: (draggedId: string, hoveredId: string) => void;
  index: number;
}

interface DraggableQuestionProps {
  question: Question;
  index: number;
  onMove: (draggedId: string, hoveredId: string) => void;
  children: React.ReactNode;
}

const DraggableQuestion: React.FC<DraggableQuestionProps> = ({ question, index, onMove, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "existing-question",
    item: { id: question.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "existing-question",
    hover: (item: { id: string; index: number }) => {
      if (!ref.current) return;

      const draggedId = item.id;
      const hoveredId = question.id;

      if (draggedId === hoveredId) return;

      onMove(draggedId, hoveredId);
      item.index = index;
    },
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="transition-opacity">
      {children}
    </div>
  );
};

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown, canMoveUp, canMoveDown, availableQuestions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateQuestion = (updates: Partial<Question>) => {
    onUpdate({ ...question, ...updates });
  };

  const addOption = () => {
    const newOption: Option = {
      id: `${question.id}-option-${Date.now()}`,
      label: `Option ${(question.options?.length || 0) + 1}`,
      value: `option${(question.options?.length || 0) + 1}`,
    };
    updateQuestion({
      options: [...(question.options || []), newOption],
    });
  };

  const updateOption = (optionId: string, updates: Partial<Option>) => {
    const updatedOptions = question.options?.map((opt) => (opt.id === optionId ? { ...opt, ...updates } : opt));
    updateQuestion({ options: updatedOptions });
  };

  const removeOption = (optionId: string) => {
    const filteredOptions = question.options?.filter((opt) => opt.id !== optionId);
    updateQuestion({ options: filteredOptions });
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-move hover:text-foreground transition-colors" />
            <CardTitle className="text-sm font-medium">{question.type.replace("-", " ").toUpperCase()}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={onMoveUp} disabled={!canMoveUp} className="h-8 w-8">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onMoveDown} disabled={!canMoveDown} className="h-8 w-8">
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-8 w-8">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Preview */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <QuestionRenderer question={question} value="" onChange={() => {}} disabled={true} />
        </div>

        {/* Question Settings */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`title-${question.id}`}>Question Title</Label>
                <Input id={`title-${question.id}`} value={question.title} onChange={(e) => updateQuestion({ title: e.target.value })} placeholder="Enter question title" />
              </div>
              <div>
                <Label htmlFor={`description-${question.id}`}>Description</Label>
                <Input id={`description-${question.id}`} value={question.description || ""} onChange={(e) => updateQuestion({ description: e.target.value })} placeholder="Enter description (optional)" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id={`required-${question.id}`} checked={question.required} onChange={(e) => updateQuestion({ required: e.target.checked })} />
              <Label htmlFor={`required-${question.id}`}>Required</Label>
            </div>

            {question.placeholder !== undefined && (
              <div>
                <Label htmlFor={`placeholder-${question.id}`}>Placeholder</Label>
                <Input id={`placeholder-${question.id}`} value={question.placeholder || ""} onChange={(e) => updateQuestion({ placeholder: e.target.value })} placeholder="Enter placeholder text" />
              </div>
            )}

            {/* Options for choice questions */}
            {(question.type === "single-choice" || question.type === "multiple-choice") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Options</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Input value={option.label} onChange={(e) => updateOption(option.id, { label: e.target.value })} placeholder={`Option ${index + 1}`} />
                      <Input value={option.value} onChange={(e) => updateOption(option.id, { value: e.target.value })} placeholder="value" className="w-32" />
                      {question.options && question.options.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeOption(option.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conditional Logic */}
            <ConditionalLogicEditor question={question} onUpdate={updateQuestion} availableQuestions={availableQuestions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const FormBuilder: React.FC<FormBuilderProps> = ({ formConfig, onFormConfigChange }) => {
  const dropRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStepId, setActiveStepId] = useState(formConfig.steps[0]?.id || "");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const currentStep = formConfig.steps.find((step) => step.id === activeStepId);

  // Import/Export Functions
  const exportFormConfig = useCallback(() => {
    const dataStr = JSON.stringify(formConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `form-config-${formConfig.id || "untitled"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [formConfig]);

  const importFormConfig = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        alert("Please select a valid JSON file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedConfig: FormConfig = JSON.parse(content);

          // Validate the imported config has required fields
          if (!importedConfig.steps || !Array.isArray(importedConfig.steps)) {
            throw new Error("Invalid form configuration: missing or invalid steps");
          }

          // Ensure each step has required fields
          importedConfig.steps.forEach((step, index) => {
            if (!step.id) step.id = `step-${Date.now()}-${index}`;
            if (!step.title) step.title = `Step ${index + 1}`;
            if (!step.questions) step.questions = [];
          });

          // Ensure form has required fields
          if (!importedConfig.id) importedConfig.id = `imported-form-${Date.now()}`;
          if (!importedConfig.title) importedConfig.title = "Imported Form";
          if (importedConfig.isMultiStep === undefined) importedConfig.isMultiStep = importedConfig.steps.length > 1;

          onFormConfigChange(importedConfig);
          setActiveStepId(importedConfig.steps[0]?.id || "");

          alert("Form configuration imported successfully!");
        } catch (error) {
          console.error("Error importing form config:", error);
          alert("Error importing form configuration. Please check that the file contains valid JSON with the correct structure.");
        }
      };
      reader.readAsText(file);

      // Reset the file input so the same file can be imported again
      event.target.value = "";
    },
    [onFormConfigChange]
  );

  const [{ isOver }, drop] = useDrop({
    accept: "question",
    drop: (item: DragItem) => {
      if (item.type === "question" && item.questionType && currentStep) {
        const newQuestion = createDefaultQuestion(item.questionType, `question-${Date.now()}`);
        addQuestionToStep(currentStep.id, newQuestion);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(dropRef);

  const addQuestionToStep = useCallback(
    (stepId: string, question: Question) => {
      const updatedSteps = formConfig.steps.map((step) => (step.id === stepId ? { ...step, questions: [...step.questions, question] } : step));
      onFormConfigChange({ ...formConfig, steps: updatedSteps });
    },
    [formConfig, onFormConfigChange]
  );

  const updateQuestion = useCallback(
    (stepId: string, questionId: string, updatedQuestion: Question) => {
      const updatedSteps = formConfig.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              questions: step.questions.map((q) => (q.id === questionId ? updatedQuestion : q)),
            }
          : step
      );
      onFormConfigChange({ ...formConfig, steps: updatedSteps });
    },
    [formConfig, onFormConfigChange]
  );

  const deleteQuestion = useCallback(
    (stepId: string, questionId: string) => {
      const updatedSteps = formConfig.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              questions: step.questions.filter((q) => q.id !== questionId),
            }
          : step
      );
      onFormConfigChange({ ...formConfig, steps: updatedSteps });
    },
    [formConfig, onFormConfigChange]
  );

  const duplicateQuestion = useCallback(
    (stepId: string, questionId: string) => {
      const step = formConfig.steps.find((s) => s.id === stepId);
      const question = step?.questions.find((q) => q.id === questionId);
      if (question) {
        const duplicatedQuestion = {
          ...question,
          id: `question-${Date.now()}`,
          title: `${question.title} (Copy)`,
        };
        addQuestionToStep(stepId, duplicatedQuestion);
      }
    },
    [formConfig, addQuestionToStep]
  );

  const moveQuestion = useCallback(
    (stepId: string, questionId: string, direction: "up" | "down") => {
      const step = formConfig.steps.find((s) => s.id === stepId);
      if (!step) return;

      const questionIndex = step.questions.findIndex((q) => q.id === questionId);
      if (questionIndex === -1) return;

      const newIndex = direction === "up" ? questionIndex - 1 : questionIndex + 1;
      if (newIndex < 0 || newIndex >= step.questions.length) return;

      const updatedQuestions = [...step.questions];
      [updatedQuestions[questionIndex], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[questionIndex]];

      const updatedSteps = formConfig.steps.map((s) => (s.id === stepId ? { ...s, questions: updatedQuestions } : s));
      onFormConfigChange({ ...formConfig, steps: updatedSteps });
    },
    [formConfig, onFormConfigChange]
  );

  const moveQuestionByDrag = useCallback(
    (draggedId: string, hoveredId: string) => {
      if (!currentStep) return;

      const draggedIndex = currentStep.questions.findIndex((q) => q.id === draggedId);
      const hoveredIndex = currentStep.questions.findIndex((q) => q.id === hoveredId);

      if (draggedIndex === -1 || hoveredIndex === -1) return;

      const updatedQuestions = [...currentStep.questions];
      const [draggedQuestion] = updatedQuestions.splice(draggedIndex, 1);
      updatedQuestions.splice(hoveredIndex, 0, draggedQuestion);

      const updatedSteps = formConfig.steps.map((s) => (s.id === currentStep.id ? { ...s, questions: updatedQuestions } : s));
      onFormConfigChange({ ...formConfig, steps: updatedSteps });
    },
    [formConfig, onFormConfigChange, currentStep]
  );

  // Get available questions for conditional logic (questions that appear before the current question)
  const getAvailableQuestions = useCallback(
    (currentQuestionId: string): { id: string; title: string }[] => {
      const allQuestions: { id: string; title: string }[] = [];

      for (const step of formConfig.steps) {
        for (const question of step.questions) {
          if (question.id === currentQuestionId) {
            // Stop when we reach the current question
            return allQuestions;
          }
          allQuestions.push({ id: question.id, title: question.title });
        }
      }

      return allQuestions;
    },
    [formConfig.steps]
  );

  const addStep = useCallback(() => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      title: `Step ${formConfig.steps.length + 1}`,
      description: "",
      questions: [],
    };
    const updatedSteps = [...formConfig.steps, newStep];
    onFormConfigChange({ ...formConfig, steps: updatedSteps });
    setActiveStepId(newStep.id);
  }, [formConfig, onFormConfigChange]);

  const deleteStep = useCallback(
    (stepId: string) => {
      if (formConfig.steps.length <= 1) return; // Don't delete the last step

      const updatedSteps = formConfig.steps.filter((step) => step.id !== stepId);
      onFormConfigChange({ ...formConfig, steps: updatedSteps });

      // If we deleted the active step, switch to the first step
      if (stepId === activeStepId) {
        setActiveStepId(updatedSteps[0]?.id || "");
      }
    },
    [formConfig, onFormConfigChange, activeStepId]
  );

  const updateStep = useCallback(
    (stepId: string, updates: Partial<Step>) => {
      const updatedSteps = formConfig.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step));
      onFormConfigChange({ ...formConfig, steps: updatedSteps });
    },
    [formConfig, onFormConfigChange]
  );

  const reorderSteps = useCallback(
    (draggedStepId: string, targetStepId: string) => {
      const steps = [...formConfig.steps];
      const draggedIndex = steps.findIndex((step) => step.id === draggedStepId);
      const targetIndex = steps.findIndex((step) => step.id === targetStepId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      // Remove the dragged step and insert it at the target position
      const [draggedStep] = steps.splice(draggedIndex, 1);
      steps.splice(targetIndex, 0, draggedStep);

      onFormConfigChange({ ...formConfig, steps });
    },
    [formConfig, onFormConfigChange]
  );

  // Draggable Step Component
  const DraggableStep: React.FC<{ step: Step }> = ({ step }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
      type: "step",
      item: { id: step.id, type: "step", stepId: step.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ isOver }, drop] = useDrop({
      accept: "step",
      hover: (draggedItem: DragItem) => {
        if (!ref.current || !draggedItem.stepId) return;

        const draggedStepId = draggedItem.stepId;
        const hoveredStepId = step.id;

        if (draggedStepId === hoveredStepId) return;

        console.log("Hovering step:", draggedStepId, "over:", hoveredStepId); // Debug log
        reorderSteps(draggedStepId, hoveredStepId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    // Attach both drag and drop to the same element
    drag(drop(ref));

    return (
      <div ref={ref} className={`flex items-center transition-all ${isDragging ? "opacity-50" : ""} ${isOver ? "bg-blue-50 border-blue-200 rounded-md p-1" : ""}`} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <div className="flex items-center cursor-move mr-1 p-1 hover:bg-muted rounded">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <Button variant={step.id === activeStepId ? "default" : "outline"} size="sm" onClick={() => setActiveStepId(step.id)} className="rounded-r-none">
          {step.title}
        </Button>
        <div className="flex">
          <Button variant={step.id === activeStepId ? "default" : "outline"} size="sm" onClick={() => setEditingStepId(editingStepId === step.id ? null : step.id)} className="rounded-none border-l-0 px-2">
            <Edit2 className="w-3 h-3" />
          </Button>
          {formConfig.steps.length > 1 && (
            <Button variant={step.id === activeStepId ? "default" : "outline"} size="sm" onClick={() => deleteStep(step.id)} className="rounded-l-none border-l-0 px-2 text-destructive hover:text-destructive">
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (!currentStep) {
    return <div>No steps available</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div ref={dropRef} className={`min-h-full p-6 transition-colors ${isOver ? "bg-muted/50" : ""}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Form Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Form Configuration</h2>
                <p className="text-sm text-muted-foreground">Import/export form configurations</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={importFormConfig} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </Button>
                <Button onClick={exportFormConfig} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>

            {/* Hidden file input for import */}
            <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileImport} style={{ display: "none" }} />
          </div>

          {/* Step Management */}
          {formConfig.isMultiStep && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Form Steps</h2>
                  <p className="text-sm text-muted-foreground">Drag steps to reorder them</p>
                </div>
                <Button onClick={addStep} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>

              {/* Step Tabs - Draggable */}
              <div className="flex flex-wrap gap-2">
                {formConfig.steps.map((step) => (
                  <DraggableStep key={step.id} step={step} />
                ))}
              </div>

              {/* Step Editor */}
              {editingStepId && (
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Edit Step</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Step Title</Label>
                        <Input value={formConfig.steps.find((s) => s.id === editingStepId)?.title || ""} onChange={(e) => updateStep(editingStepId, { title: e.target.value })} placeholder="Enter step title" />
                      </div>
                      <div>
                        <Label>Step Description</Label>
                        <Input value={formConfig.steps.find((s) => s.id === editingStepId)?.description || ""} onChange={(e) => updateStep(editingStepId, { description: e.target.value })} placeholder="Enter step description (optional)" />
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{currentStep.title}</h1>
            {currentStep.description && <p className="text-muted-foreground">{currentStep.description}</p>}
            {formConfig.isMultiStep && (
              <p className="text-sm text-muted-foreground">
                Step {formConfig.steps.findIndex((s) => s.id === activeStepId) + 1} of {formConfig.steps.length}
              </p>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {currentStep.questions.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center">Drag and drop questions from the sidebar to start building your form</p>
                </CardContent>
              </Card>
            ) : (
              currentStep.questions.map((question, index) => (
                <DraggableQuestion key={question.id} question={question} index={index} onMove={moveQuestionByDrag}>
                  <QuestionEditor
                    question={question}
                    onUpdate={(updatedQuestion) => updateQuestion(currentStep.id, question.id, updatedQuestion)}
                    onDelete={() => deleteQuestion(currentStep.id, question.id)}
                    onDuplicate={() => duplicateQuestion(currentStep.id, question.id)}
                    onMoveUp={() => moveQuestion(currentStep.id, question.id, "up")}
                    onMoveDown={() => moveQuestion(currentStep.id, question.id, "down")}
                    canMoveUp={index > 0}
                    canMoveDown={index < currentStep.questions.length - 1}
                    availableQuestions={getAvailableQuestions(question.id)}
                    onMove={moveQuestionByDrag}
                    index={index}
                  />
                </DraggableQuestion>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
