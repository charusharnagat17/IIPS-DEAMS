package com.iips.deams.model;

import com.iips.deams.model.enums.QuestionType;
import org.springframework.data.annotation.TypeAlias;

@TypeAlias("DESCRIPTIVE")
public class DescriptiveQuestion extends Question {

    public DescriptiveQuestion() {
        super();
        this.type = QuestionType.DESCRIPTIVE.name();
        this.negativeMarks = 0.0;
    }

    public DescriptiveQuestion(String subjectId, String topic, String difficulty,
                               String questionText, double marks, String modelAnswer) {
        super(subjectId, topic, QuestionType.DESCRIPTIVE.name(), difficulty, questionText, marks);
        this.modelAnswer = modelAnswer;
        this.negativeMarks = 0.0;
    }

    @Override
    public boolean isObjective() {
        return false;
    }
}
