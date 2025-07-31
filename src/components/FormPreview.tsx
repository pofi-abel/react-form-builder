import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import type { FormConfig, FormResponse, Question } from "@/types/form";
import { ChevronLeft, ChevronRight, Copy, Check, Eye, EyeOff } from "lucide-react";

interface FormPreviewProps {
  formConfig: FormConfig;
}

const evaluateConditionalLogic = (question: Question, responses: FormResponse): boolean => {
  if (!question.conditionalLogic || question.conditionalLogic.length === 0) {
    return true;
  }

  return question.conditionalLogic.every((logic) => {
    const responseValue = responses[logic.questionId];

    if (responseValue === undefined || responseValue === null) {
      return false;
    }

    switch (logic.condition) {
      case "equals":
        if (Array.isArray(logic.value)) {
          return Array.isArray(responseValue) ? responseValue.some((v) => logic.value.includes(v)) : logic.value.includes(String(responseValue));
        }
        return String(responseValue) === String(logic.value);

      case "not-equals":
        if (Array.isArray(logic.value)) {
          return Array.isArray(responseValue) ? !responseValue.some((v) => logic.value.includes(v)) : !logic.value.includes(String(responseValue));
        }
        return String(responseValue) !== String(logic.value);

      case "contains":
        if (Array.isArray(responseValue)) {
          return Array.isArray(logic.value) ? logic.value.some((v) => responseValue.includes(v)) : responseValue.includes(String(logic.value));
        }
        return String(responseValue).toLowerCase().includes(String(logic.value).toLowerCase());

      case "not-contains":
        if (Array.isArray(responseValue)) {
          return Array.isArray(logic.value) ? !logic.value.some((v) => responseValue.includes(v)) : !responseValue.includes(String(logic.value));
        }
        return !String(responseValue).toLowerCase().includes(String(logic.value).toLowerCase());

      default:
        return true;
    }
  });
};

export const FormPreview: React.FC<FormPreviewProps> = ({ formConfig }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<FormResponse>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedResponseJson, setCopiedResponseJson] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [showResponseViewer, setShowResponseViewer] = useState(false);
  const [responseViewMode, setResponseViewMode] = useState<'table' | 'json'>('table');

  const currentStep = formConfig.steps[currentStepIndex];
  const visibleQuestions = currentStep?.questions.filter((question) => evaluateConditionalLogic(question, responses)) || [];

  // Clean up responses for questions that are no longer visible due to conditional logic
  const cleanupHiddenResponses = (newResponses: FormResponse) => {
    const visibleQuestionIds = new Set();

    // Collect all currently visible question IDs across all steps
    formConfig.steps.forEach((step) => {
      step.questions.forEach((question) => {
        if (evaluateConditionalLogic(question, newResponses)) {
          visibleQuestionIds.add(question.id);
        }
      });
    });

    // Create cleaned responses object with only visible questions
    const cleanedResponses: FormResponse = {};
    Object.keys(newResponses).forEach((questionId) => {
      if (visibleQuestionIds.has(questionId)) {
        cleanedResponses[questionId] = newResponses[questionId];
      }
    });

    return cleanedResponses;
  };

  const handleResponseChange = (questionId: string, value: FormResponse[string]) => {
    const newResponses = {
      ...responses,
      [questionId]: value,
    };

    // Clean up any responses from questions that are now hidden
    const cleanedResponses = cleanupHiddenResponses(newResponses);

    setResponses(cleanedResponses);
  };

  const handleNext = () => {
    if (currentStepIndex < formConfig.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    console.log("Form submitted with responses:", responses);
  };

  const copyJsonToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(formConfig, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
    }
  };

  const copyResponseJsonToClipboard = async () => {
    try {
      // Create a formatted response object with question details for admin view
      const adminResponseView = {
        formId: formConfig.id,
        formTitle: formConfig.title,
        submissionTimestamp: new Date().toISOString(),
        responses: Object.entries(responses).map(([questionId, value]) => {
          // Find the question details
          let questionDetails = null;
          for (const step of formConfig.steps) {
            const question = step.questions.find(q => q.id === questionId);
            if (question) {
              questionDetails = {
                id: question.id,
                type: question.type,
                title: question.title,
                required: question.required,
                stepTitle: step.title
              };
              break;
            }
          }
          
          return {
            questionId,
            question: questionDetails,
            value,
            displayValue: Array.isArray(value) ? value.join(', ') : value
          };
        }),
        rawResponses: responses
      };
      
      const jsonString = JSON.stringify(adminResponseView, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopiedResponseJson(true);
      setTimeout(() => setCopiedResponseJson(false), 2000);
    } catch (err) {
      console.error("Failed to copy response JSON:", err);
    }
  };

  const validateCurrentStep = (): boolean => {
    return visibleQuestions.every((question) => {
      if (!question.required) return true;
      const value = responses[question.id];
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  };

  const isLastStep = currentStepIndex === formConfig.steps.length - 1;
  const canProceed = validateCurrentStep();

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="text-4xl">✅</div>
              <h2 className="text-2xl font-bold text-green-600">{formConfig.settings.successMessage || "Form Submitted Successfully!"}</h2>
              <p className="text-muted-foreground">Thank you for your submission. Your responses have been recorded.</p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStepIndex(0);
                  setResponses({});
                }}
                variant="outline"
              >
                Fill Form Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No form steps available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{formConfig.title}</h1>
          {formConfig.description && <p className="text-muted-foreground">{formConfig.description}</p>}
        </div>

        {/* Progress Indicator */}
        {formConfig.isMultiStep && formConfig.settings.showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStepIndex + 1} of {formConfig.steps.length}
              </span>
              <span>{Math.round(((currentStepIndex + 1) / formConfig.steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStepIndex + 1) / formConfig.steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{currentStep.title}</CardTitle>
            {currentStep.description && <p className="text-muted-foreground">{currentStep.description}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            {visibleQuestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No questions to display in this step</p>
            ) : (
              visibleQuestions.map((question) => <QuestionRenderer key={question.id} question={question} value={responses[question.id]} onChange={(value) => handleResponseChange(question.id, value)} />)
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStepIndex === 0 || !formConfig.settings.allowBack} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {isLastStep ? (
            <Button onClick={handleSubmit} disabled={!canProceed} className="flex items-center gap-2">
              {formConfig.settings.submitButtonText || "Submit"}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed} className="flex items-center gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Form Responses Viewer */}
        {Object.keys(responses).length > 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Form Responses</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={responseViewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setResponseViewMode('table')}
                      className="rounded-r-none border-r"
                    >
                      Table View
                    </Button>
                    <Button
                      variant={responseViewMode === 'json' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setResponseViewMode('json')}
                      className="rounded-l-none"
                    >
                      JSON View
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowResponseViewer(!showResponseViewer)} className="flex items-center gap-2">
                    {showResponseViewer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showResponseViewer ? "Hide" : "Show"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyResponseJsonToClipboard} className="flex items-center gap-2" disabled={copiedResponseJson}>
                    {copiedResponseJson ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedResponseJson ? "Copied!" : "Copy Data"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showResponseViewer && (
              <CardContent>
                {responseViewMode === 'table' ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-4">Response Summary:</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-3 border-b">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Form:</strong> {formConfig.title}</div>
                            <div><strong>Form ID:</strong> {formConfig.id}</div>
                            <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
                            <div><strong>Total Responses:</strong> {Object.keys(responses).length}</div>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(responses).map(([questionId, value]) => {
                                // Find the question details
                                let questionDetails = null;
                                let stepTitle = '';
                                for (const step of formConfig.steps) {
                                  const question = step.questions.find(q => q.id === questionId);
                                  if (question) {
                                    questionDetails = question;
                                    stepTitle = step.title;
                                    break;
                                  }
                                }
                                
                                if (!questionDetails) return null;
                                
                                const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                                
                                return (
                                  <tr key={questionId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{stepTitle}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <div className="font-medium">{questionDetails.title}</div>
                                      {questionDetails.description && (
                                        <div className="text-xs text-gray-500 mt-1">{questionDetails.description}</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {questionDetails.type}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                      {questionDetails.required ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                          Required
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          Optional
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <div className="max-w-xs break-words">
                                        {displayValue || <span className="text-gray-400 italic">No response</span>}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Current User Responses (Raw JSON):</h4>
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 font-mono">{JSON.stringify(responses, null, 2)}</pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Complete JSON (with metadata):</h4>
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 font-mono">{JSON.stringify(
                        {
                          formId: formConfig.id,
                          formTitle: formConfig.title,
                          submissionTimestamp: new Date().toISOString(),
                          responses: Object.entries(responses).map(([questionId, value]) => {
                            // Find the question details
                            let questionDetails = null;
                            for (const step of formConfig.steps) {
                              const question = step.questions.find(q => q.id === questionId);
                              if (question) {
                                questionDetails = {
                                  id: question.id,
                                  type: question.type,
                                  title: question.title,
                                  required: question.required,
                                  stepTitle: step.title
                                };
                                break;
                              }
                            }
                            
                            return {
                              questionId,
                              question: questionDetails,
                              value,
                              displayValue: Array.isArray(value) ? value.join(', ') : value
                            };
                          }),
                          rawResponses: responses
                        },
                        null,
                        2
                      )}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* JSON Configuration Viewer */}
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Form Configuration (JSON)</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowJsonViewer(!showJsonViewer)} className="flex items-center gap-2">
                  {showJsonViewer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showJsonViewer ? "Hide" : "Show"} JSON
                </Button>
                <Button variant="outline" size="sm" onClick={copyJsonToClipboard} className="flex items-center gap-2" disabled={copiedJson}>
                  {copiedJson ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedJson ? "Copied!" : "Copy JSON"}
                </Button>
              </div>
            </div>
          </CardHeader>
          {showJsonViewer && (
            <CardContent>
              <div className="relative">
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 font-mono">{JSON.stringify(formConfig, null, 2)}</pre>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">{JSON.stringify({ responses, currentStep: currentStepIndex }, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
