package com.iips.deams.strategy;

import com.iips.deams.model.ExamAttempt;
import com.iips.deams.model.Question;
import com.iips.deams.model.enums.QuestionType;
import org.springframework.stereotype.Component;

@Component
public class CodeEvaluationStrategy implements EvaluationStrategy {

    @Override public QuestionType getSupportedType() { return QuestionType.CODE; }

    @Override
    public double evaluate(Question question, ExamAttempt.StudentAnswer answer, boolean negativeMarkingEnabled, double defaultNegativeFactor) {
        if (!answer.isAttempted() || answer.getCodeSnippet() == null || answer.getCodeSnippet().trim().isEmpty()) {
            answer.setMarksAwarded(0.0); answer.setFacultyComment("No code submitted"); answer.setEvaluated(true);
            return 0.0;
        }
        if (!answer.isEvaluated()) {
            answer.setFacultyComment("Code execution & test case verification pending faculty approval");
            return 0.0;
        }
        return answer.getMarksAwarded();
    }
}
