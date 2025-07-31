import type { FormConfig, Question, Step, ConditionalLogic } from "../types/form";

// Test utilities for creating mock form data
export const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: "test-question-1",
  type: "short-text",
  title: "Test Question",
  description: "Test description",
  required: false,
  ...overrides,
});

export const createMockSingleChoiceQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: "test-single-choice",
  type: "single-choice",
  title: "Choose one option",
  required: true,
  options: [
    { id: "opt1", label: "Yes", value: "yes" },
    { id: "opt2", label: "No", value: "no" },
  ],
  ...overrides,
});

export const createMockMultipleChoiceQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: "test-multiple-choice",
  type: "multiple-choice",
  title: "Choose multiple options",
  required: false,
  options: [
    { id: "opt1", label: "Option 1", value: "option1" },
    { id: "opt2", label: "Option 2", value: "option2" },
    { id: "opt3", label: "Option 3", value: "option3" },
  ],
  ...overrides,
});

export const createMockConditionalQuestion = (questionId: string, condition: ConditionalLogic["condition"] = "equals", value: string = "yes"): Question => ({
  id: "conditional-question",
  type: "email",
  title: "Conditional Email Question",
  required: true,
  conditionalLogic: [
    {
      questionId,
      condition,
      value,
    },
  ],
});

export const createMockStep = (overrides: Partial<Step> = {}): Step => ({
  id: "test-step",
  title: "Test Step",
  description: "Test step description",
  questions: [createMockQuestion()],
  ...overrides,
});

export const createMockFormConfig = (overrides: Partial<FormConfig> = {}): FormConfig => ({
  id: "test-form",
  title: "Test Form",
  description: "Test form description",
  isMultiStep: false,
  steps: [createMockStep()],
  settings: {
    allowBack: true,
    showProgress: true,
    submitButtonText: "Submit",
    successMessage: "Thank you!",
  },
  ...overrides,
});

export const createMockMultiStepForm = (): FormConfig => ({
  id: "multi-step-form",
  title: "Multi-Step Test Form",
  isMultiStep: true,
  steps: [
    {
      id: "step-1",
      title: "Personal Information",
      questions: [createMockQuestion({ id: "name", title: "Your Name", required: true }), createMockSingleChoiceQuestion({ id: "has-email", title: "Do you have an email?" })],
    },
    {
      id: "step-2",
      title: "Contact Details",
      questions: [createMockConditionalQuestion("has-email", "equals", "yes"), createMockMultipleChoiceQuestion({ id: "interests", title: "Your interests" })],
    },
  ],
  settings: {
    allowBack: true,
    showProgress: true,
    submitButtonText: "Submit Form",
    successMessage: "Thank you for your submission!",
  },
});

// Helper functions for testing drag and drop
export const createMockDragItem = (questionType: Question["type"]) => ({
  id: "test-drag-item",
  type: "question" as const,
  questionType,
});

// Form response helpers
export const createMockFormResponse = (responses: Record<string, string | string[] | number | boolean | File | Date | null> = {}) => ({
  "test-question-1": "Test answer",
  ...responses,
});
