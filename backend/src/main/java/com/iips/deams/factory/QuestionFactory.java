package com.iips.deams.factory;

import com.iips.deams.model.*;
import com.iips.deams.model.enums.QuestionType;

import java.util.List;

public class QuestionFactory {

    public static Question createQuestion(QuestionType type,
                                          String subjectId,
                                          String topic,
                                          String difficulty,
                                          String questionText,
                                          double marks) {
        return switch (type) {
            case MCQ -> new MultipleChoiceQuestion(subjectId, topic, difficulty, questionText, marks, 0.25, List.of());
            case DESCRIPTIVE -> new DescriptiveQuestion(subjectId, topic, difficulty, questionText, marks, "");
            case CODE -> new CodeQuestion(subjectId, topic, difficulty, questionText, marks, "", List.of());
        };
    }

    public static MultipleChoiceQuestion createMcq(String subjectId, String topic, String difficulty,
                                                   String questionText, double marks, double negativeMarks,
                                                   List<Question.Option> options) {
        return new MultipleChoiceQuestion(subjectId, topic, difficulty, questionText, marks, negativeMarks, options);
    }

    public static DescriptiveQuestion createDescriptive(String subjectId, String topic, String difficulty,
                                                         String questionText, double marks, String modelAnswer) {
        return new DescriptiveQuestion(subjectId, topic, difficulty, questionText, marks, modelAnswer);
    }

    public static CodeQuestion createCodeQuestion(String subjectId, String topic, String difficulty,
                                                  String questionText, double marks, String codeSnippet,
                                                  List<Question.TestCase> testCases) {
        return new CodeQuestion(subjectId, topic, difficulty, questionText, marks, codeSnippet, testCases);
    }
}
