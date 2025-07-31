import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import type { Question, FormResponse } from "@/types/form";

interface QuestionRendererProps {
  question: Question;
  value: FormResponse[string];
  onChange: (value: FormResponse[string]) => void;
  disabled?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, value, onChange, disabled = false }) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case "short-text":
        return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder} disabled={disabled} required={question.required} />;

      case "long-text":
        return <Textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder} disabled={disabled} required={question.required} rows={4} />;

      case "email":
        return <Input type="email" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder || "Enter your email"} disabled={disabled} required={question.required} />;

      case "phone":
        return <Input type="tel" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder || "Enter your phone number"} disabled={disabled} required={question.required} />;

      case "number":
        return (
          <Input
            type="number"
            value={(value as number) || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={question.placeholder}
            disabled={disabled}
            required={question.required}
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      case "date":
        return <Input type="date" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} required={question.required} />;

      case "file-upload":
        return <Input type="file" onChange={(e) => onChange(e.target.files?.[0] || null)} disabled={disabled} required={question.required} multiple={false} />;

      case "single-choice":
        return (
          <RadioGroup value={(value as string) || ""} onValueChange={onChange} disabled={disabled}>
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple-choice": {
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option.value));
                    }
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </div>
        );
      }

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
          </div>
          {renderQuestionInput()}
        </div>
      </CardContent>
    </Card>
  );
};
