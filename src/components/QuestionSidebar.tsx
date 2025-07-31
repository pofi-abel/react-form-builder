import React from "react";
import { useDrag } from "react-dnd";
import { Card, CardContent } from "@/components/ui/card";
import type { QuestionType, DragItem } from "@/types/form";
import { Type, AlignLeft, CheckSquare, Circle, Calendar, Upload, Hash, Mail, Phone } from "lucide-react";

const questionTypes: Array<{
  type: QuestionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    type: "short-text",
    label: "Short Text",
    icon: Type,
    description: "Single line text input",
  },
  {
    type: "long-text",
    label: "Long Text",
    icon: AlignLeft,
    description: "Multi-line text area",
  },
  {
    type: "single-choice",
    label: "Single Choice",
    icon: Circle,
    description: "Radio buttons for single selection",
  },
  {
    type: "multiple-choice",
    label: "Multiple Choice",
    icon: CheckSquare,
    description: "Checkboxes for multiple selections",
  },
  {
    type: "date",
    label: "Date",
    icon: Calendar,
    description: "Date picker input",
  },
  {
    type: "file-upload",
    label: "File Upload",
    icon: Upload,
    description: "File upload input",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric input",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    description: "Email address input",
  },
  {
    type: "phone",
    label: "Phone",
    icon: Phone,
    description: "Phone number input",
  },
];

interface DraggableQuestionItemProps {
  questionType: QuestionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const DraggableQuestionItem: React.FC<DraggableQuestionItemProps> = ({ questionType, label, icon: Icon, description }) => {
  const dragRef = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: "question",
    item: {
      id: `new-${questionType}-${Date.now()}`,
      type: "question",
      questionType,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(dragRef);

  return (
    <div ref={dragRef} className={`cursor-move transition-all hover:shadow-md ${isDragging ? "opacity-50" : ""}`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Icon className="w-5 h-5 mt-0.5 text-primary" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground">{label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const QuestionSidebar: React.FC = () => {
  return (
    <div className="w-64 bg-background border-r border-border p-4 overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Question Types</h2>
          <p className="text-sm text-muted-foreground mb-4">Drag and drop to add questions to your form</p>
        </div>

        <div className="space-y-2">
          {questionTypes.map((questionType) => (
            <DraggableQuestionItem key={questionType.type} questionType={questionType.type} label={questionType.label} icon={questionType.icon} description={questionType.description} />
          ))}
        </div>
      </div>
    </div>
  );
};
