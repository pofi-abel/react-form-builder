export type QuestionType = "short-text" | "long-text" | "single-choice" | "multiple-choice" | "date" | "file-upload" | "number" | "email" | "phone";

export interface Option {
  id: string;
  label: string;
  value: string;
}

export interface ConditionalLogic {
  questionId: string;
  condition: "equals" | "not-equals" | "contains" | "not-contains";
  value: string | string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: Option[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditionalLogic?: ConditionalLogic[];
}

export interface Step {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  isMultiStep: boolean;
  steps: Step[];
  settings: {
    allowBack: boolean;
    showProgress: boolean;
    submitButtonText: string;
    successMessage: string;
  };
}

export interface FormResponse {
  [questionId: string]: string | string[] | number | boolean | File | Date | null;
}

export interface DragItem {
  id: string;
  type: "question" | "step";
  questionType?: QuestionType;
  stepId?: string;
}
