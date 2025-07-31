import React, { useState } from "react";
import { FormRenderer } from "@/components/FormRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormConfig, FormResponse } from "@/types/form";
import { Copy, Check } from "lucide-react";

// Sample form configuration that would be exported from the form builder
const sampleFormConfig: FormConfig = {
  id: "sample-medical-form",
  title: "Medical History Form",
  description: "Please provide your medical history information",
  isMultiStep: true,
  steps: [
    {
      id: "step-1",
      title: "Personal Information",
      description: "Basic personal details",
      questions: [
        {
          id: "question-1",
          type: "short-text",
          title: "Full Name",
          description: "Enter your full legal name",
          required: true,
          placeholder: "John Doe",
        },
        {
          id: "question-2",
          type: "email",
          title: "Email Address",
          required: true,
          placeholder: "john@example.com",
        },
        {
          id: "question-3",
          type: "date",
          title: "Date of Birth",
          required: true,
        },
      ],
    },
    {
      id: "step-2",
      title: "Medical History",
      description: "Your current and past medical conditions",
      questions: [
        {
          id: "question-4",
          type: "single-choice",
          title: "Do you wear vision correction?",
          required: true,
          options: [
            { id: "option-1", label: "Glasses", value: "glasses" },
            { id: "option-2", label: "Contact Lenses", value: "contact-lenses" },
            { id: "option-3", label: "None", value: "none" },
          ],
        },
        {
          id: "question-5",
          type: "short-text",
          title: "What type of glasses do you wear?",
          description: "Please specify the type (reading, distance, bifocals, etc.)",
          required: false,
          conditionalLogic: [
            {
              questionId: "question-4",
              condition: "equals",
              value: "glasses",
            },
          ],
        },
        {
          id: "question-6",
          type: "multiple-choice",
          title: "Do you have any of the following conditions?",
          description: "Select all that apply",
          required: false,
          options: [
            { id: "option-4", label: "Diabetes", value: "diabetes" },
            { id: "option-5", label: "High Blood Pressure", value: "hypertension" },
            { id: "option-6", label: "Heart Disease", value: "heart-disease" },
            { id: "option-7", label: "Allergies", value: "allergies" },
            { id: "option-8", label: "None of the above", value: "none" },
          ],
        },
      ],
    },
    {
      id: "step-3",
      title: "Additional Information",
      description: "Any additional details you'd like to share",
      questions: [
        {
          id: "question-7",
          type: "long-text",
          title: "Please describe your allergies in detail",
          description: "Include triggers, symptoms, and severity",
          required: true,
          placeholder: "Describe your allergies...",
          conditionalLogic: [
            {
              questionId: "question-6",
              condition: "contains",
              value: "allergies",
            },
          ],
        },
        {
          id: "question-8",
          type: "long-text",
          title: "Additional Comments",
          description: "Any other medical information you'd like to share",
          required: false,
          placeholder: "Any additional information...",
        },
        {
          id: "question-9",
          type: "file-upload",
          title: "Upload Medical Records (Optional)",
          description: "You may upload relevant medical documents",
          required: false,
        },
      ],
    },
  ],
  settings: {
    allowBack: true,
    showProgress: true,
    submitButtonText: "Submit Medical Form",
    successMessage: "Thank you! Your medical history has been recorded successfully.",
  },
};

// Another example with different question types
const simpleFormConfig: FormConfig = {
  id: "feedback-form",
  title: "Customer Feedback",
  description: "Help us improve our service",
  isMultiStep: false,
  steps: [
    {
      id: "step-1",
      title: "Feedback",
      description: "",
      questions: [
        {
          id: "question-1",
          type: "single-choice",
          title: "How satisfied are you with our service?",
          required: true,
          options: [
            { id: "option-1", label: "Very Satisfied", value: "very-satisfied" },
            { id: "option-2", label: "Satisfied", value: "satisfied" },
            { id: "option-3", label: "Neutral", value: "neutral" },
            { id: "option-4", label: "Dissatisfied", value: "dissatisfied" },
            { id: "option-5", label: "Very Dissatisfied", value: "very-dissatisfied" },
          ],
        },
        {
          id: "question-2",
          type: "number",
          title: "On a scale of 1-10, how likely are you to recommend us?",
          required: true,
          placeholder: "Enter a number from 1 to 10",
        },
        {
          id: "question-3",
          type: "long-text",
          title: "What can we improve?",
          description: "Please provide specific feedback",
          required: false,
          placeholder: "Your suggestions...",
        },
      ],
    },
  ],
  settings: {
    allowBack: false,
    showProgress: false,
    submitButtonText: "Submit Feedback",
    successMessage: "Thank you for your feedback!",
  },
};

export const FormRendererDemo: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<"medical" | "feedback">("medical");
  const [showJson, setShowJson] = useState(false);
  const [submittedResponses, setSubmittedResponses] = useState<FormResponse | null>(null);
  const [copiedResponseJson, setCopiedResponseJson] = useState(false);
  const [responseViewMode, setResponseViewMode] = useState<'table' | 'json'>('table');

  const currentFormConfig = selectedForm === "medical" ? sampleFormConfig : simpleFormConfig;

  const handleFormSubmit = (responses: FormResponse) => {
    console.log("Form submitted with responses:", responses);
    setSubmittedResponses(responses);
  };

  const copyResponseJsonToClipboard = async () => {
    if (!submittedResponses) return;
    
    try {
      // Create a formatted response object with question details for admin view
      const adminResponseView = {
        formId: currentFormConfig.id,
        formTitle: currentFormConfig.title,
        submissionTimestamp: new Date().toISOString(),
        responses: Object.entries(submittedResponses).map(([questionId, value]) => {
          // Find the question details
          let questionDetails = null;
          for (const step of currentFormConfig.steps) {
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
        rawResponses: submittedResponses
      };
      
      const jsonString = JSON.stringify(adminResponseView, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopiedResponseJson(true);
      setTimeout(() => setCopiedResponseJson(false), 2000);
    } catch (err) {
      console.error("Failed to copy response JSON:", err);
    }
  };

  const resetDemo = () => {
    setSubmittedResponses(null);
    setShowJson(false);
    setCopiedResponseJson(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Demo Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Form Renderer Demo - JSON to Live Form</CardTitle>
            <p className="text-center text-muted-foreground">This demonstrates how exported JSON from the form builder can be used to render functional forms in other applications.</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <div className="flex gap-2">
                <Button variant={selectedForm === "medical" ? "default" : "outline"} onClick={() => setSelectedForm("medical")}>
                  Medical Form (Multi-step)
                </Button>
                <Button variant={selectedForm === "feedback" ? "default" : "outline"} onClick={() => setSelectedForm("feedback")}>
                  Feedback Form (Single-step)
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowJson(!showJson)}>
                  {showJson ? "Hide" : "Show"} JSON Config
                </Button>
                <Button variant="outline" onClick={resetDemo}>
                  Reset Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JSON Configuration Display */}
        {showJson && (
          <Card>
            <CardHeader>
              <CardTitle>Form Configuration JSON</CardTitle>
              <p className="text-sm text-muted-foreground">This is the JSON that would be exported from the form builder and used to render the form below.</p>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 font-mono">{JSON.stringify(currentFormConfig, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        {/* Live Form Renderer */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Live Form Rendered from JSON</h2>
          <FormRenderer formConfig={currentFormConfig} onSubmit={handleFormSubmit} />
        </div>

        {/* Submitted Responses Display */}
        {submittedResponses && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submitted Responses</CardTitle>
                  <p className="text-sm text-muted-foreground">This shows the data that would be collected from the form submission.</p>
                </div>
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
                  <Button variant="outline" size="sm" onClick={copyResponseJsonToClipboard} className="flex items-center gap-2" disabled={copiedResponseJson}>
                    {copiedResponseJson ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedResponseJson ? "Copied!" : "Copy Data"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {responseViewMode === 'table' ? (
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Admin Dashboard View:</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-4 border-b">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><strong>Form:</strong> {currentFormConfig.title}</div>
                        <div><strong>Form ID:</strong> {currentFormConfig.id}</div>
                        <div><strong>Submitted:</strong> {new Date().toLocaleString()}</div>
                        <div><strong>Responses:</strong> {Object.keys(submittedResponses).length}</div>
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Response</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(submittedResponses).map(([questionId, value]) => {
                            // Find the question details
                            let questionDetails = null;
                            let stepTitle = '';
                            for (const step of currentFormConfig.steps) {
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
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{stepTitle}</td>
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
                                  {value && typeof value === 'string' && value.length > 50 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Length: {value.length} characters
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {Object.keys(submittedResponses).length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No responses submitted yet
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Raw Response Data (JSON):</h4>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 font-mono">{JSON.stringify(submittedResponses, null, 2)}</pre>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Complete JSON Response (for API integration):</h4>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 font-mono">{JSON.stringify(
                    {
                      formId: currentFormConfig.id,
                      formTitle: currentFormConfig.title,
                      submissionTimestamp: new Date().toISOString(),
                      responses: Object.entries(submittedResponses).map(([questionId, value]) => {
                        // Find the question details
                        let questionDetails = null;
                        for (const step of currentFormConfig.steps) {
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
                      summary: {
                        totalQuestions: Object.keys(submittedResponses).length,
                        formType: currentFormConfig.isMultiStep ? 'multi-step' : 'single-step',
                        stepsCompleted: currentFormConfig.steps.length
                      },
                      rawResponses: submittedResponses
                    },
                    null,
                    2
                  )}</pre>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Key Features Demonstrated:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Complete form rendering from JSON configuration</li>
                <li>Multi-step form navigation with progress tracking</li>
                <li>Conditional logic (questions shown/hidden based on answers)</li>
                <li>All question types (text, email, date, choices, file upload, etc.)</li>
                <li>Form validation and required field checking</li>
                <li>Customizable settings (navigation, progress, submit button text)</li>
                <li>Response collection and submission handling</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Use Cases:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Embedding forms in external websites or applications</li>
                <li>Creating survey platforms that consume form builder JSON</li>
                <li>Building form libraries that work with exported configurations</li>
                <li>Integrating with content management systems</li>
                <li>Creating white-label form solutions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Technical Benefits:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Zero coupling between form builder and form renderer</li>
                <li>JSON-based configuration enables easy storage and transmission</li>
                <li>Consistent rendering across different platforms and frameworks</li>
                <li>Easy to extend with new question types or features</li>
                <li>Version control friendly (JSON configurations can be tracked)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
