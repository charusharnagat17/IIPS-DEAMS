package com.iips.deams.strategy;

import com.iips.deams.model.ExamAttempt;
import com.iips.deams.model.Question;
import com.iips.deams.model.enums.QuestionType;
import org.springframework.stereotype.Component;

@Component
public class McqEvaluationStrategy implements EvaluationStrategy {

    @Override
    public QuestionType getSupportedType() { return QuestionType.MCQ; }

    @Override
    public double evaluate(Question question, ExamAttempt.StudentAnswer answer, boolean negativeMarkingEnabled, double defaultNegativeFactor) {
        if (!answer.isAttempted() || answer.getSelectedOptionId() == null || answer.getSelectedOptionId().trim().isEmpty()) {
            answer.setMarksAwarded(0.0); answer.setCorrect(false); answer.setEvaluated(true);
            answer.setFacultyComment("Unattempted question");
            return 0.0;
        }

        String correctOptId = question.getOptions() != null ? question.getOptions().stream().filter(Question.Option::isCorrect).map(Question.Option::getId).findFirst().orElse(null) : null;

        if (correctOptId != null && correctOptId.equalsIgnoreCase(answer.getSelectedOptionId().trim())) {
            answer.setCorrect(true); answer.setMarksAwarded(question.getMarks());
            answer.setFacultyComment("Correct (+ " + question.getMarks() + ")");
            answer.setEvaluated(true);
            return question.getMarks();
        } else {
            answer.setCorrect(false);
            double penalty = negativeMarkingEnabled ? (question.getNegativeMarks() > 0 ? question.getNegativeMarks() : defaultNegativeFactor) : 0.0;
            answer.setMarksAwarded(-penalty);
            answer.setFacultyComment("Incorrect. Penalty: -" + penalty);
            answer.setEvaluated(true);
            return -penalty;
        }
    }
}
