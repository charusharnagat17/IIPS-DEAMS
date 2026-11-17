package com.iips.deams.model;

import com.iips.deams.model.enums.QuestionType;
import org.springframework.data.annotation.TypeAlias;

import java.util.List;

@TypeAlias("MCQ")
public class MultipleChoiceQuestion extends Question {

    public MultipleChoiceQuestion() {
        super();
        this.type = QuestionType.MCQ.name();
    }

    public MultipleChoiceQuestion(String subjectId, String topic, String difficulty,
                                  String questionText, double marks, double negativeMarks,
                                  List<Option> options) {
        super(subjectId, topic, QuestionType.MCQ.name(), difficulty, questionText, marks);
        this.negativeMarks = negativeMarks;
        this.options = options;
    }

    public void addOption(String id, String text, boolean isCorrect, String explanation) {
        this.options.add(new Option(id, text, isCorrect, explanation));
    }

    public Option getCorrectOption() {
        if (this.options == null) return null;
        for (Option opt : this.options) {
            if (opt.isCorrect()) {
                return opt;
            }
        }
        return null;
    }

    @Override
    public boolean isObjective() {
        return true;
    }
}
