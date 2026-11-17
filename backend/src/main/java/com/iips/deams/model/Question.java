package com.iips.deams.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.iips.deams.dto.ExamQuestionView;
import com.iips.deams.model.enums.DifficultyLevel;
import com.iips.deams.model.enums.QuestionType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.*;

@Document(collection = "questions")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type", visible = true, defaultImpl = Question.class)
@JsonSubTypes({
        @JsonSubTypes.Type(value = MultipleChoiceQuestion.class, name = "MCQ"),
        @JsonSubTypes.Type(value = DescriptiveQuestion.class, name = "DESCRIPTIVE"),
        @JsonSubTypes.Type(value = CodeQuestion.class, name = "CODE")
})
public class Question {
    @Id
    protected String id;
    protected String courseId;
    protected String subjectId;
    protected String topic;
    protected String type;
    protected String difficulty;
    protected String questionText;
    protected String codeSnippet;
    protected List<Option> options = new ArrayList<>();
    protected String modelAnswer;
    protected List<TestCase> testCases = new ArrayList<>();
    protected double marks = 1.0;
    protected double negativeMarks = 0.25;
    protected String createdByFacultyId;
    protected LocalDateTime createdAt = LocalDateTime.now();

    public Question() {}
    public Question(String subjectId, String topic, String type, String difficulty, String questionText, double marks) {
        this.subjectId = subjectId; this.topic = topic; this.type = type; this.difficulty = difficulty;
        this.questionText = questionText; this.marks = marks; this.createdAt = LocalDateTime.now();
    }

    public QuestionType getQuestionTypeEnum() { return QuestionType.fromString(this.type); }
    public DifficultyLevel getDifficultyLevel() { return DifficultyLevel.fromString(this.difficulty); }
    public boolean isObjective() { return QuestionType.MCQ.name().equalsIgnoreCase(this.type); }
    public boolean isSubjective() { return !isObjective(); }

    public ExamQuestionView toStudentSafeView(boolean randomizeOptions) {
        List<ExamQuestionView.StudentOption> optViews = new ArrayList<>();
        if (this.options != null && !this.options.isEmpty()) {
            for (Option o : this.options) optViews.add(new ExamQuestionView.StudentOption(o.getId(), o.getText()));
            if (randomizeOptions) Collections.shuffle(optViews, new Random());
        }
        List<ExamQuestionView.StudentSampleIo> sampleList = new ArrayList<>();
        if (this.testCases != null && !this.testCases.isEmpty()) {
            for (TestCase tc : this.testCases) {
                if (!tc.isHidden()) sampleList.add(new ExamQuestionView.StudentSampleIo(tc.getInput(), tc.getExpectedOutput()));
            }
        }
        return new ExamQuestionView(this.id, this.subjectId, this.topic, this.type, this.difficulty,
                this.questionText, this.codeSnippet, optViews, sampleList, this.marks, this.negativeMarks);
    }

    public static class Option {
        private String id;
        private String text;
        private boolean correct;
        private String explanation;
        public Option() {}
        public Option(String id, String text, boolean correct, String explanation) {
            this.id = id; this.text = text; this.correct = correct; this.explanation = explanation;
        }
        public String getId() { return id; } public void setId(String id) { this.id = id; }
        public String getText() { return text; } public void setText(String text) { this.text = text; }
        public boolean isCorrect() { return correct; } public void setCorrect(boolean correct) { this.correct = correct; }
        public String getExplanation() { return explanation; } public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public static class TestCase {
        private String input;
        private String expectedOutput;
        private boolean isHidden;
        public TestCase() {}
        public TestCase(String input, String expectedOutput, boolean isHidden) {
            this.input = input; this.expectedOutput = expectedOutput; this.isHidden = isHidden;
        }
        public String getInput() { return input; } public void setInput(String input) { this.input = input; }
        public String getExpectedOutput() { return expectedOutput; } public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
        public boolean isHidden() { return isHidden; } public void setHidden(boolean hidden) { this.isHidden = hidden; }
    }

    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getCourseId() { return courseId; } public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getSubjectId() { return subjectId; } public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    public String getTopic() { return topic; } public void setTopic(String topic) { this.topic = topic; }
    public String getType() { return type; } public void setType(String type) { this.type = type; }
    public String getDifficulty() { return difficulty; } public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getQuestionText() { return questionText; } public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getCodeSnippet() { return codeSnippet; } public void setCodeSnippet(String codeSnippet) { this.codeSnippet = codeSnippet; }
    public List<Option> getOptions() { return options; } public void setOptions(List<Option> options) { this.options = options; }
    public String getModelAnswer() { return modelAnswer; } public void setModelAnswer(String modelAnswer) { this.modelAnswer = modelAnswer; }
    public List<TestCase> getTestCases() { return testCases; } public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
    public double getMarks() { return marks; } public void setMarks(double marks) { this.marks = marks; }
    public double getNegativeMarks() { return negativeMarks; } public void setNegativeMarks(double negativeMarks) { this.negativeMarks = negativeMarks; }
    public String getCreatedByFacultyId() { return createdByFacultyId; } public void setCreatedByFacultyId(String createdByFacultyId) { this.createdByFacultyId = createdByFacultyId; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
