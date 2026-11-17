package com.iips.deams.strategy;

import com.iips.deams.model.ExamAttempt;
import com.iips.deams.model.Question;
import com.iips.deams.model.enums.QuestionType;

public interface EvaluationStrategy {
    QuestionType getSupportedType();

    /**
     * Polymorphically evaluates candidate answer according to question type rules
     */
    double evaluate(Question question,
                    ExamAttempt.StudentAnswer answer,
                    boolean negativeMarkingEnabled,
                    double defaultNegativeFactor);
}
