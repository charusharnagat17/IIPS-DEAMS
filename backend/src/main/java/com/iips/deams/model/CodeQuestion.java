package com.iips.deams.model;

import com.iips.deams.model.enums.QuestionType;
import org.springframework.data.annotation.TypeAlias;

import java.util.List;

@TypeAlias("CODE")
public class CodeQuestion extends Question {

    public CodeQuestion() {
        super();
        this.type = QuestionType.CODE.name();
        this.negativeMarks = 0.0;
    }

    public CodeQuestion(String subjectId, String topic, String difficulty,
                        String questionText, double marks, String codeSnippet,
                        List<TestCase> testCases) {
        super(subjectId, topic, QuestionType.CODE.name(), difficulty, questionText, marks);
        this.codeSnippet = codeSnippet;
        this.testCases = testCases;
        this.negativeMarks = 0.0;
    }

    @Override
    public boolean isObjective() {
        return false;
    }
}
