import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormConfig, FormResponse, Question } from "@/types/form";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormRendererProps {
  formConfig: FormConfig;
  onSubmit?: (responses: FormResponse) => void;
  resetKey?: string | number; // Used to force reset of internal state
}

interface FormRendererComponentProps {
  question: Question;
  value: string | number | boolean | string[] | File | Date | null | undefined;
  onChange: (value: string | number | boolean | string[] | File | Date | null) => void;
}

const FormRendererComponent: React.FC<FormRendererComponentProps> = ({ question, value, onChange }) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (checked) {
      onChange([...currentValues, optionValue]);
    } else {
      onChange(currentValues.filter((v: string) => v !== optionValue));
    }
  };

  switch (question.type) {
    case "short-text":
    case "email":
    case "phone":
      return (
        <div className="space-y-2">
          <Label htmlFor={question.id} className="text-sm font-medium">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
          <Input
            id={question.id}
            type={question.type === "email" ? "email" : question.type === "phone" ? "tel" : "text"}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
            className="w-full"
          />
        </div>
      );

    case "long-text":
      return (
        <div className="space-y-2">
          <Label htmlFor={question.id} className="text-sm font-medium">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
          <Textarea id={question.id} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder} required={question.required} className="w-full min-h-[100px]" />
        </div>
      );

    case "number":
      return (
        <div className="space-y-2">
          <Label htmlFor={question.id} className="text-sm font-medium">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
          <Input
            id={question.id}
            type="number"
            value={typeof value === "number" || typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
            className="w-full"
          />
        </div>
      );

    case "date":
      return (
        <div className="space-y-2">
          <Label htmlFor={question.id} className="text-sm font-medium">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
          <Input id={question.id} type="date" value={value instanceof Date ? value.toISOString().split("T")[0] : typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} required={question.required} className="w-full" />
        </div>
      );

    case "file-upload":
      return (
        <div className="space-y-2">
          <Label htmlFor={question.id} className="text-sm font-medium">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
          <Input id={question.id} type="file" onChange={(e) => onChange(e.target.files?.[0] || null)} required={question.required} className="w-full" />
        </div>
      );

    case "single-choice":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
          </div>
          <RadioGroup value={typeof value === "string" ? value : ""} onValueChange={onChange}>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case "multiple-choice":
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
          </div>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox id={option.id} checked={Array.isArray(value) ? value.includes(option.value) : false} onCheckedChange={(checked) => handleCheckboxChange(option.value, checked === true)} />
                <Label htmlFor={option.id} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 border border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-muted-foreground">Unsupported question type: {question.type}</p>
        </div>
      );
  }
};

export const FormRenderer: React.FC<FormRendererProps> = ({ formConfig, onSubmit, resetKey }) => {
  const [responses, setResponses] = useState<FormResponse>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form state when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      setResponses({});
      setCurrentStepIndex(0);
      setIsSubmitted(false);
    }
  }, [resetKey]);

  const currentStep = formConfig.steps[currentStepIndex];
  const isLastStep = currentStepIndex === formConfig.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Evaluate conditional logic to determine if a question should be shown
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic || question.conditionalLogic.length === 0) {
      return true;
    }

    return question.conditionalLogic.every((condition) => {
      const responseValue = responses[condition.questionId];
      const conditionValue = condition.value;

      if (responseValue === undefined || responseValue === null || responseValue === "") {
        return false;
      }

      switch (condition.condition) {
        case "equals":
          if (Array.isArray(conditionValue)) {
            return conditionValue.includes(String(responseValue));
          }
          return responseValue === conditionValue;

        case "not-equals":
          if (Array.isArray(conditionValue)) {
            return !conditionValue.includes(String(responseValue));
          }
          return responseValue !== conditionValue;

        case "contains":
          return String(responseValue).toLowerCase().includes(String(conditionValue).toLowerCase());

        case "not-contains":
          return !String(responseValue).toLowerCase().includes(String(conditionValue).toLowerCase());

        default:
          return false;
      }
    });
  };

  const updateResponse = (questionId: string, value: string | number | boolean | string[] | File | Date | null) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const validateCurrentStep = (): boolean => {
    const visibleQuestions = currentStep.questions.filter(shouldShowQuestion);
    const requiredQuestions = visibleQuestions.filter((q) => q.required);

    return requiredQuestions.every((question) => {
      const value = responses[question.id];
      return value !== undefined && value !== null && value !== "";
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStepIndex((prev) => prev + 1);
      }
    } else {
      alert("Please fill in all required fields before proceeding.");
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit?.(responses);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800">Thank You!</h2>
            <p className="text-muted-foreground">{formConfig.settings?.successMessage || "Your form has been submitted successfully."}</p>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Your Responses:</h3>
              <pre className="text-xs text-left overflow-auto">{JSON.stringify(responses, null, 2)}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No form steps available.</p>
        </CardContent>
      </Card>
    );
  }

  const visibleQuestions = currentStep.questions.filter(shouldShowQuestion);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl">{formConfig.title}</CardTitle>
          {formConfig.description && <p className="text-muted-foreground">{formConfig.description}</p>}

          {formConfig.isMultiStep && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{currentStep.title}</h2>
              {currentStep.description && <p className="text-muted-foreground">{currentStep.description}</p>}

              {formConfig.settings?.showProgress && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentStepIndex + 1) / formConfig.steps.length) * 100}%`,
                    }}
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {formConfig.steps.length}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {visibleQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No questions to display in this step based on your previous answers.</p>
          </div>
        ) : (
          visibleQuestions.map((question) => <FormRendererComponent key={question.id} question={question} value={responses[question.id]} onChange={(value) => updateResponse(question.id, value)} />)
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {formConfig.isMultiStep && !isFirstStep && formConfig.settings?.allowBack !== false && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <Button onClick={handleNext}>
            {isLastStep ? (
              formConfig.settings?.submitButtonText || "Submit"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
