package com.iips.deams.service;

import com.iips.deams.dto.ExamQuestionView;
import com.iips.deams.model.ExamAttempt;
import com.iips.deams.model.Question;
import com.iips.deams.model.enums.QuestionType;
import com.iips.deams.strategy.EvaluationStrategy;
import com.iips.deams.strategy.EvaluationStrategyRegistry;
import com.iips.deams.strategy.GradingStrategy;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ExamEngineService {

    private final GradingStrategy gradingStrategy;
    private final EvaluationStrategyRegistry strategyRegistry;

    public ExamEngineService(GradingStrategy gradingStrategy, EvaluationStrategyRegistry strategyRegistry) {
        this.gradingStrategy = gradingStrategy;
        this.strategyRegistry = strategyRegistry;
    }
    public List<ExamQuestionView> prepareStudentQuestions(List<Question> questions, boolean randomizeQuestions, boolean randomizeOptions) {
        List<Question> workingList = new ArrayList<>(questions);
        if (randomizeQuestions) {
            Collections.shuffle(workingList, new Random());
        }

        List<ExamQuestionView> result = new ArrayList<>();
        for (Question q : workingList) {
            // Polymorphic method encapsulated in Question domain model
            result.add(q.toStudentSafeView(randomizeOptions));
        }
        return result;
    }
    public String calculateGrade(double percentage) {
        // Delegated to GradingStrategy (Strategy Pattern)
        return gradingStrategy.evaluateGrade(percentage, 100.0).getLetterGrade();
    }
    public double evaluateObjectiveAnswers(List<ExamAttempt.StudentAnswer> answers,
                                           Map<String, Question> questionMap,
                                           boolean negativeMarkingEnabled,
                                           double defaultNegativeFactor) {
        double objectiveScore = 0.0;

        for (ExamAttempt.StudentAnswer ans : answers) {
            Question q = questionMap.get(ans.getQuestionId());
            if (q == null) continue;

            QuestionType qType = q.getQuestionTypeEnum();
            if (qType == QuestionType.MCQ) {
                // Dynamically fetch polymorphic evaluation strategy (Strategy Pattern)
                EvaluationStrategy strategy = strategyRegistry.getStrategy(qType);
                double delta = strategy.evaluate(q, ans, negativeMarkingEnabled, defaultNegativeFactor);
                objectiveScore += delta;
            }
        }

        return Math.max(0.0, objectiveScore);
    }
}
