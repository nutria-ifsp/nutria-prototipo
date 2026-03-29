using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriaAPI.Data;
using NutriaAPI.DTOs;
using NutriaAPI.Models;

namespace NutriaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly NutriaDbContext _context;

        public ProfileController(NutriaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get a user's profile by username.
        /// Frontend calls: GET /api/profile/username/{username}
        /// Returns: user profile info
        /// </summary>
        [HttpGet("username/{username}")]
        public async Task<ActionResult<ProfileDto>> GetProfileByUsername(string username)
        {
            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.User!.Username == username);

            if (profile == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new ProfileDto
            {
                Id = profile.Id,
                Username = profile.User?.Username ?? username,
                Name = profile.Name,
                Bio = profile.Bio,
                AvatarUrl = profile.AvatarUrl,
                FollowersCount = profile.FollowersCount,
                FollowingCount = profile.FollowingCount,
                PostsCount = profile.PostsCount,
                Streak = profile.Streak
            });
        }

        /// <summary>
        /// Get current user's profile (requires authentication).
        /// Frontend calls: GET /api/profile/me
        /// Returns: current user's profile info
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<ProfileDto>> GetMyProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return NotFound();
            }

            return Ok(new ProfileDto
            {
                Id = profile.Id,
                Username = profile.User?.Username ?? string.Empty,
                Name = profile.Name,
                Bio = profile.Bio,
                AvatarUrl = profile.AvatarUrl,
                FollowersCount = profile.FollowersCount,
                FollowingCount = profile.FollowingCount,
                PostsCount = profile.PostsCount,
                Streak = profile.Streak
            });
        }

        /// <summary>
        /// Update current user's profile.
        /// Frontend calls: PUT /api/profile/me
        /// Body: { name, bio, avatarUrl }
        /// Returns: updated profile
        /// </summary>
        [HttpPut("me")]
        [Authorize]
        public async Task<ActionResult<ProfileDto>> UpdateMyProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(request.Username) && profile.User != null)
            {
                var normalizedUsername = request.Username.Trim();
                var usernameTaken = await _context.Users
                    .AnyAsync(u => u.Username == normalizedUsername && u.Id != userId.Value);

                if (usernameTaken)
                {
                    return BadRequest(new { message = "Username already in use" });
                }

                profile.User.Username = normalizedUsername;
                profile.User.UpdatedAt = DateTime.UtcNow;
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                profile.Name = request.Name;
            }

            if (request.Bio != null)
            {
                profile.Bio = request.Bio;
            }

            if (request.AvatarUrl != null)
            {
                profile.AvatarUrl = request.AvatarUrl;
            }

            profile.UpdatedAt = DateTime.UtcNow;

            _context.Profiles.Update(profile);
            await _context.SaveChangesAsync();

            return Ok(new ProfileDto
            {
                Id = profile.Id,
                Username = profile.User?.Username ?? string.Empty,
                Name = profile.Name,
                Bio = profile.Bio,
                AvatarUrl = profile.AvatarUrl,
                FollowersCount = profile.FollowersCount,
                FollowingCount = profile.FollowingCount,
                PostsCount = profile.PostsCount,
                Streak = profile.Streak
            });
        }

        /// <summary>
        /// Get daily goals for today.
        /// Frontend calls: GET /api/profile/goals/today
        /// Returns: list of daily goals (calories, protein, water)
        /// </summary>
        [HttpGet("goals/today")]
        [Authorize]
        public async Task<ActionResult<List<DailyGoalDto>>> GetTodayGoals()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var today = DateTime.UtcNow.Date;

            var goals = await _context.DailyGoals
                .Where(g => g.UserId == userId && g.Date.Date == today)
                .ToListAsync();

            return Ok(goals.Select(g => new DailyGoalDto
            {
                Id = g.Id,
                GoalType = g.GoalType,
                TargetValue = g.TargetValue,
                CurrentValue = g.CurrentValue,
                Unit = g.Unit,
                Progress = g.TargetValue > 0 ? g.CurrentValue / g.TargetValue : 0
            }).ToList());
        }

        /// <summary>
        /// Update a daily goal's current value.
        /// Frontend calls: PUT /api/profile/goals/{goalId}
        /// Body: { currentValue }
        /// Returns: updated goal
        /// </summary>
        [HttpPut("goals/{goalId}")]
        [Authorize]
        public async Task<ActionResult<DailyGoalDto>> UpdateDailyGoal(int goalId, [FromBody] UpdateDailyGoalRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var goal = await _context.DailyGoals
                .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId);

            if (goal == null)
            {
                return NotFound();
            }

            goal.CurrentValue = request.CurrentValue;
            goal.UpdatedAt = DateTime.UtcNow;

            _context.DailyGoals.Update(goal);
            await _context.SaveChangesAsync();

            return Ok(new DailyGoalDto
            {
                Id = goal.Id,
                GoalType = goal.GoalType,
                TargetValue = goal.TargetValue,
                CurrentValue = goal.CurrentValue,
                Unit = goal.Unit,
                Progress = goal.TargetValue > 0 ? goal.CurrentValue / goal.TargetValue : 0
            });
        }

        // ========== HELPER METHODS ==========

        /// <summary>
        /// Extracts the current user ID from the JWT token.
        /// </summary>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return null;
            }

            return userId;
        }
    }
}
