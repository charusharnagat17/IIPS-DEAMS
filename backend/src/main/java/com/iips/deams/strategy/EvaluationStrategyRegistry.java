package com.iips.deams.strategy;

import com.iips.deams.model.enums.QuestionType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class EvaluationStrategyRegistry {

    private final Map<QuestionType, EvaluationStrategy> strategies = new EnumMap<>(QuestionType.class);

    public EvaluationStrategyRegistry(List<EvaluationStrategy> strategyList) {
        for (EvaluationStrategy strategy : strategyList) {
            strategies.put(strategy.getSupportedType(), strategy);
        }
    }

    public EvaluationStrategy getStrategy(QuestionType type) {
        EvaluationStrategy strategy = strategies.get(type);
        if (strategy == null) {
            // Default to MCQ if not matched
            return strategies.get(QuestionType.MCQ);
        }
        return strategy;
    }
}
