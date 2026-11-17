package com.iips.deams.strategy;

import com.iips.deams.model.ExamAttempt;
import com.iips.deams.model.Question;
import com.iips.deams.model.enums.QuestionType;
import org.springframework.stereotype.Component;

@Component
public class DescriptiveEvaluationStrategy implements EvaluationStrategy {

    @Override
    public QuestionType getSupportedType() { return QuestionType.DESCRIPTIVE; }

    @Override
    public double evaluate(Question question, ExamAttempt.StudentAnswer answer, boolean negativeMarkingEnabled, double defaultNegativeFactor) {
        if (!answer.isAttempted() || answer.getDescriptiveText() == null || answer.getDescriptiveText().trim().isEmpty()) {
            answer.setMarksAwarded(0.0); answer.setFacultyComment("No subjective answer submitted");
            answer.setEvaluated(true); return 0.0;
        }
        if (!answer.isEvaluated()) {
            answer.setFacultyComment("Pending subjective examiner review"); return 0.0;
        }
        return answer.getMarksAwarded();
    }
}
