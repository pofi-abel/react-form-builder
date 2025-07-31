import { describe, it, expect } from "vitest";
import type { Question, FormResponse } from "../types/form";
import { createMockSingleChoiceQuestion, createMockConditionalQuestion, createMockFormResponse } from "./test-utils";

// Import the function we want to test
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

describe("evaluateConditionalLogic", () => {
  describe("questions without conditional logic", () => {
    it("should return true for questions without conditional logic", () => {
      const question = createMockSingleChoiceQuestion();
      const responses = createMockFormResponse();

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should return true for questions with empty conditional logic array", () => {
      const question = createMockSingleChoiceQuestion({ conditionalLogic: [] });
      const responses = createMockFormResponse();

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });
  });

  describe("equals condition", () => {
    it("should return true when response equals the condition value", () => {
      const question = createMockConditionalQuestion("has-email", "equals", "yes");
      const responses = createMockFormResponse({ "has-email": "yes" });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should return false when response does not equal the condition value", () => {
      const question = createMockConditionalQuestion("has-email", "equals", "yes");
      const responses = createMockFormResponse({ "has-email": "no" });

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });

    it("should return false when response is undefined", () => {
      const question = createMockConditionalQuestion("has-email", "equals", "yes");
      const responses = createMockFormResponse({});

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });

    it("should return false when response is null", () => {
      const question = createMockConditionalQuestion("has-email", "equals", "yes");
      const responses = createMockFormResponse({ "has-email": null });

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });
  });

  describe("not-equals condition", () => {
    it("should return true when response does not equal the condition value", () => {
      const question = createMockConditionalQuestion("has-email", "not-equals", "yes");
      const responses = createMockFormResponse({ "has-email": "no" });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should return false when response equals the condition value", () => {
      const question = createMockConditionalQuestion("has-email", "not-equals", "yes");
      const responses = createMockFormResponse({ "has-email": "yes" });

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });
  });

  describe("contains condition", () => {
    it("should return true when single response contains the condition value", () => {
      const question = createMockConditionalQuestion("interests", "contains", "sport");
      const responses = createMockFormResponse({ interests: "I love sports and music" });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should return true when array response contains the condition value", () => {
      const question = createMockConditionalQuestion("hobbies", "contains", "reading");
      const responses = createMockFormResponse({ hobbies: ["reading", "swimming", "cooking"] });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should return false when response does not contain the condition value", () => {
      const question = createMockConditionalQuestion("interests", "contains", "sport");
      const responses = createMockFormResponse({ interests: "I love music and art" });

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });
  });

  describe("not-contains condition", () => {
    it("should return true when response does not contain the condition value", () => {
      const question = createMockConditionalQuestion("interests", "not-contains", "sport");
      const responses = createMockFormResponse({ interests: "I love music and art" });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should return false when response contains the condition value", () => {
      const question = createMockConditionalQuestion("interests", "not-contains", "sport");
      const responses = createMockFormResponse({ interests: "I love sports and music" });

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });
  });

  describe("multiple conditions", () => {
    it("should return true when all conditions are met", () => {
      const question: Question = {
        id: "conditional-question",
        type: "email",
        title: "Email Question",
        required: true,
        conditionalLogic: [
          { questionId: "has-email", condition: "equals", value: "yes" },
          { questionId: "age", condition: "not-equals", value: "under-18" },
        ],
      };
      const responses = createMockFormResponse({
        "has-email": "yes",
        age: "over-18",
      });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should return false when any condition is not met", () => {
      const question: Question = {
        id: "conditional-question",
        type: "email",
        title: "Email Question",
        required: true,
        conditionalLogic: [
          { questionId: "has-email", condition: "equals", value: "yes" },
          { questionId: "age", condition: "not-equals", value: "under-18" },
        ],
      };
      const responses = createMockFormResponse({
        "has-email": "yes",
        age: "under-18",
      });

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });
  });

  describe("array values in conditions", () => {
    it("should handle array values in equals condition", () => {
      const question: Question = {
        id: "conditional-question",
        type: "short-text",
        title: "Conditional Question",
        required: true,
        conditionalLogic: [{ questionId: "options", condition: "equals", value: ["option1", "option2"] }],
      };
      const responses = createMockFormResponse({ options: ["option1", "option3"] });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should handle array values in contains condition", () => {
      const question: Question = {
        id: "conditional-question",
        type: "short-text",
        title: "Conditional Question",
        required: true,
        conditionalLogic: [{ questionId: "hobbies", condition: "contains", value: ["reading", "writing"] }],
      };
      const responses = createMockFormResponse({ hobbies: ["reading", "swimming"] });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should handle multiple equals values (OR condition)", () => {
      const question: Question = {
        id: "conditional-question",
        type: "short-text",
        title: "Conditional Question",
        required: true,
        conditionalLogic: [{ questionId: "vision-aid", condition: "equals", value: ["glasses", "contact-lense"] }],
      };
      const responses = createMockFormResponse({ "vision-aid": "glasses" });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should handle multiple equals values with different response", () => {
      const question: Question = {
        id: "conditional-question",
        type: "short-text",
        title: "Conditional Question",
        required: true,
        conditionalLogic: [{ questionId: "vision-aid", condition: "equals", value: ["glasses", "contact-lense"] }],
      };
      const responses = createMockFormResponse({ "vision-aid": "contact-lense" });

      expect(evaluateConditionalLogic(question, responses)).toBe(true);
    });

    it("should handle multiple equals values with non-matching response", () => {
      const question: Question = {
        id: "conditional-question",
        type: "short-text",
        title: "Conditional Question",
        required: true,
        conditionalLogic: [{ questionId: "vision-aid", condition: "equals", value: ["glasses", "contact-lense"] }],
      };
      const responses = createMockFormResponse({ "vision-aid": "none" });

      expect(evaluateConditionalLogic(question, responses)).toBe(false);
    });
  });
});
