using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace NutriaAPI.Services
{
    /// <summary>
    /// Handles authentication: token generation, password hashing, validation
    /// 
    /// JWT Flow:
    /// 1. User logs in with email + password
    /// 2. We verify password and create a signed JWT token
    /// 3. Token contains UserId + expiration, signed with a secret key
    /// 4. Frontend stores token and sends it with every request
    /// 5. We verify the token signature to prove user is who they claim
    /// </summary>
    public interface IAuthService
    {
        string GenerateToken(int userId, string username);
        string HashPassword(string password);
        bool VerifyPassword(string password, string hash);
        int? GetUserIdFromToken(string token);
    }

    public class AuthService : IAuthService
    {
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;

        public AuthService(IConfiguration config)
        {
            _jwtSecret = config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured");
            _jwtIssuer = config["Jwt:Issuer"] ?? "NutriaAPI";
        }

        /// <summary>
        /// Creates a JWT token that proves the user is logged in.
        /// Token expires in 7 days.
        /// </summary>
        public string GenerateToken(int userId, string username)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(new[]
                {
                    new System.Security.Claims.Claim("UserId", userId.ToString()),
                    new System.Security.Claims.Claim("Username", username)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _jwtIssuer,
                Audience = "NutriaApp",
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        /// <summary>
        /// Extracts UserId from a JWT token.
        /// Returns null if token is invalid/expired.
        /// </summary>
        public int? GetUserIdFromToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_jwtSecret);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = "NutriaApp",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "UserId");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return null;

                return userId;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Hashes a password using PBKDF2.
        /// Never store plain passwords! Always hash them.
        /// </summary>
        public string HashPassword(string password)
        {
            using (var rng = new Rfc2898DeriveBytes(password, 16, 10000, HashAlgorithmName.SHA256))
            {
                var salt = rng.Salt;
                var hash = rng.GetBytes(20);

                var hashBytes = new byte[36];
                Buffer.BlockCopy(salt, 0, hashBytes, 0, 16);
                Buffer.BlockCopy(hash, 0, hashBytes, 16, 20);

                return Convert.ToBase64String(hashBytes);
            }
        }

        /// <summary>
        /// Verifies a password against a hash.
        /// Returns true if password matches, false otherwise.
        /// </summary>
        public bool VerifyPassword(string password, string hash)
        {
            try
            {
                var hashBytes = Convert.FromBase64String(hash);
                var salt = new byte[16];
                Buffer.BlockCopy(hashBytes, 0, salt, 0, 16);

                var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
                var hash2 = pbkdf2.GetBytes(20);

                for (int i = 0; i < 20; i++)
                {
                    if (hashBytes[i + 16] != hash2[i])
                        return false;
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
