using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutriaAPI.DTOs;
using NutriaAPI.Services;

namespace NutriaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MealAnalysisController : ControllerBase
    {
        private readonly IMealAnalysisService _mealAnalysisService;

        public MealAnalysisController(IMealAnalysisService mealAnalysisService)
        {
            _mealAnalysisService = mealAnalysisService;
        }

        /// <summary>
        /// Analyze a photo of a meal and estimate calories/macros using AI.
        /// Frontend calls: POST /api/mealanalysis/analyze
        /// Body: { imageBase64, note? }  (imageBase64 WITHOUT the "data:image/jpeg;base64," prefix)
        /// Returns: estimated calories, macros and identified food items
        /// </summary>
        [HttpPost("analyze")]
        [Authorize]
        public async Task<ActionResult<MealAnalysisResponse>> Analyze([FromBody] AnalyzeMealRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ImageBase64))
            {
                return BadRequest(new { message = "Imagem é obrigatória" });
            }

            try
            {
                var result = await _mealAnalysisService.AnalyzeMealAsync(request.ImageBase64, request.Note);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(502, new { message = ex.Message });
            }
        }
    }
}
