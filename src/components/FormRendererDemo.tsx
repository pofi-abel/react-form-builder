import React, { useState } from "react";
import { FormRenderer } from "@/components/FormRenderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormConfig, FormResponse } from "@/types/form";

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

  const currentFormConfig = selectedForm === "medical" ? sampleFormConfig : simpleFormConfig;

  const handleFormSubmit = (responses: FormResponse) => {
    console.log("Form submitted with responses:", responses);
    setSubmittedResponses(responses);
  };

  const resetDemo = () => {
    setSubmittedResponses(null);
    setShowJson(false);
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
              <CardTitle>Submitted Responses</CardTitle>
              <p className="text-sm text-muted-foreground">This shows the data that would be collected from the form submission.</p>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96 font-mono">{JSON.stringify(submittedResponses, null, 2)}</pre>
            </CardContent>
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
