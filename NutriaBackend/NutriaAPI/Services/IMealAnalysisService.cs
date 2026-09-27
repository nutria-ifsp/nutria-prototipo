using NutriaAPI.DTOs;

namespace NutriaAPI.Services
{
    /// <summary>
    /// Analyzes a photo of a meal and estimates calories/macros using an AI vision model.
    /// </summary>
    public interface IMealAnalysisService
    {
        Task<MealAnalysisResponse> AnalyzeMealAsync(string imageBase64, string? note);
    }
}
