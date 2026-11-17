package com.iips.deams.strategy;

import com.iips.deams.model.enums.GradeLetter;
import org.springframework.stereotype.Component;

@Component
public class UgcCbcsGradingStrategy implements GradingStrategy {

    @Override
    public GradingResult evaluateGrade(double score, double maxMarks) {
        if (maxMarks <= 0) return new GradingResult(0.0, GradeLetter.F.getGradeCode(), 0.0, false);
        double pct = (score / maxMarks) * 100.0;
        GradeLetter grade = GradeLetter.fromPercentage(pct);
        return new GradingResult(pct, grade.getGradeCode(), grade.getGradePoint(), grade.isPass());
    }
}
