using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriaAPI.Data;
using NutriaAPI.DTOs;
using NutriaAPI.Models;
using NutriaAPI.Services;

namespace NutriaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly NutriaDbContext _context;
        private readonly IAuthService _authService;

        public AuthController(NutriaDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        /// <summary>
        /// Register a new user.
        /// Frontend calls: POST /api/auth/register
        /// Body: { email, password, username, name }
        /// Returns: JWT token + user info
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new { message = "Email, password, and username are required" });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var normalizedUsername = request.Username.Trim();
            var normalizedName = request.Name?.Trim() ?? string.Empty;

            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.Trim().ToLower() == normalizedEmail || u.Username.Trim().ToLower() == normalizedUsername.ToLower());

            if (existingUser != null)
            {
                return BadRequest(new { message = "User with this email or username already exists" });
            }

            // Create new user
            var user = new User
            {
                Email = normalizedEmail,
                Username = normalizedUsername,
                PasswordHash = _authService.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create profile
            var profile = new Profile
            {
                UserId = user.Id,
                Name = normalizedName,
                Bio = "",
                FollowersCount = 0,
                FollowingCount = 0,
                PostsCount = 0
            };

            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _authService.GenerateToken(user.Id, user.Username);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Profile = new ProfileDto
                    {
                        Id = profile.Id,
                        Name = profile.Name,
                        Bio = profile.Bio,
                        AvatarUrl = profile.AvatarUrl,
                        FollowersCount = 0,
                        FollowingCount = 0,
                        PostsCount = 0,
                        Streak = 0
                    }
                }
            });
        }

        /// <summary>
        /// Login user.
        /// Frontend calls: POST /api/auth/login
        /// Body: { email, password }
        /// Returns: JWT token + user info
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            // Find user by email
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Email.Trim().ToLower() == normalizedEmail);

            if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Generate JWT token
            var token = _authService.GenerateToken(user.Id, user.Username);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Profile = user.Profile != null ? new ProfileDto
                    {
                        Id = user.Profile.Id,
                        Name = user.Profile.Name,
                        Bio = user.Profile.Bio,
                        AvatarUrl = user.Profile.AvatarUrl,
                        FollowersCount = user.Profile.FollowersCount,
                        FollowingCount = user.Profile.FollowingCount,
                        PostsCount = user.Profile.PostsCount,
                        Streak = user.Profile.Streak
                    } : null
                }
            });
        }

        /// <summary>
        /// Verify token validity.
        /// Frontend calls: GET /api/auth/verify
        /// Returns: user info if token is valid, 401 if invalid
        /// </summary>
        [HttpGet("verify")]
        [Authorize]
        public async Task<ActionResult<UserDto>> VerifyToken()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Profile = user.Profile != null ? new ProfileDto
                {
                    Id = user.Profile.Id,
                    Name = user.Profile.Name,
                    Bio = user.Profile.Bio,
                    AvatarUrl = user.Profile.AvatarUrl,
                    FollowersCount = user.Profile.FollowersCount,
                    FollowingCount = user.Profile.FollowingCount,
                    PostsCount = user.Profile.PostsCount,
                    Streak = user.Profile.Streak
                } : null
            });
        }
    }
}
