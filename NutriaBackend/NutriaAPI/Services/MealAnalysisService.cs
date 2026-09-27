using System.Text;
using System.Text.Json;
using NutriaAPI.DTOs;

namespace NutriaAPI.Services
{
    /// <summary>
    /// Implementation of IMealAnalysisService using Google's Gemini API
    /// (gemini-2.0-flash by default, vision-capable via inline_data).
    /// Configure the API key under "Gemini:ApiKey" in appsettings.json or user-secrets —
    /// never commit a real key to source control. Get a key at https://aistudio.google.com/apikey
    ///
    /// To swap providers again, this is the only file that needs to change; the controller
    /// and frontend contract (MealAnalysisResponse) stay the same.
    /// </summary>
    public class MealAnalysisService : IMealAnalysisService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<MealAnalysisService> _logger;

        private const string SystemPrompt =
            "Você é um nutricionista assistente. Analise a foto do prato de comida enviada e " +
            "estime, da forma mais realista possível, os alimentos presentes, o total de calorias " +
            "e os macronutrientes (proteína, carboidrato e gordura em gramas). " +
            "Responda APENAS com um JSON válido, sem markdown, sem texto extra, no seguinte formato: " +
            "{\"description\": string, \"calories\": number, \"proteinGrams\": number, " +
            "\"carbsGrams\": number, \"fatGrams\": number, \"confidence\": number entre 0 e 1, " +
            "\"items\": [{\"name\": string, \"estimatedGrams\": number, \"calories\": number}]}";

        public MealAnalysisService(HttpClient httpClient, IConfiguration configuration, ILogger<MealAnalysisService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<MealAnalysisResponse> AnalyzeMealAsync(string imageBase64, string? note)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "Gemini:ApiKey não configurada. Defina em appsettings.json, appsettings.Development.json ou user-secrets.");
            }

            var model = _configuration["Gemini:Model"] ?? "gemini-2.0-flash";

            var userText = SystemPrompt + "\n\nAnalise esta refeição." +
                (string.IsNullOrWhiteSpace(note) ? string.Empty : $" Observação do usuário: {note}");

            var requestBody = new
            {
                contents = new object[]
                {
                    new
                    {
                        role = "user",
                        parts = new object[]
                        {
                            new { text = userText },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = "image/jpeg",
                                    data = imageBase64
                                }
                            }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.2,
                    response_mime_type = "application/json"
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Gemini meal analysis failed ({Status}): {Body}", response.StatusCode, responseBody);
                throw new InvalidOperationException("Falha ao analisar a refeição com a IA. Tente novamente.");
            }

            using var doc = JsonDocument.Parse(responseBody);

            if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                _logger.LogError("Gemini response had no candidates: {Body}", responseBody);
                throw new InvalidOperationException("A IA não retornou um resultado válido.");
            }

            var contentText = candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(contentText))
            {
                throw new InvalidOperationException("A IA não retornou um resultado válido.");
            }

            try
            {
                var result = JsonSerializer.Deserialize<MealAnalysisResponse>(contentText, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (result == null)
                {
                    throw new InvalidOperationException("Não foi possível interpretar o resultado da IA.");
                }

                return result;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse Gemini JSON content: {Content}", contentText);
                throw new InvalidOperationException("Não foi possível interpretar o resultado da IA.");
            }
        }
    }
}
