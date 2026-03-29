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
    public class FollowController : ControllerBase
    {
        private readonly NutriaDbContext _context;

        public FollowController(NutriaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Follow a user.
        /// Frontend calls: POST /api/follow/{userIdToFollow}
        /// Returns: follow confirmation + updated follower count
        /// </summary>
        [HttpPost("{userIdToFollow}")]
        [Authorize]
        public async Task<ActionResult<FollowResponse>> FollowUser(int userIdToFollow)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized();
            }

            if (currentUserId == userIdToFollow)
            {
                return BadRequest(new { message = "You cannot follow yourself" });
            }

            // Check if user exists
            var targetUser = await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userIdToFollow);

            if (targetUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Check if already following
            var existingFollow = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == userIdToFollow);

            if (existingFollow != null)
            {
                return BadRequest(new { message = "You already follow this user" });
            }

            // Get current user's profile
            var currentUserProfile = await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == currentUserId);

            if (currentUserProfile == null)
            {
                return NotFound(new { message = "Your profile not found" });
            }

            // Create follow relationship
            var follow = new Follow
            {
                FollowerId = currentUserId!.Value,
                FollowingId = userIdToFollow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Follows.Add(follow);

            // Update counts
            currentUserProfile.FollowingCount += 1;
            targetUser.FollowersCount += 1;

            _context.Profiles.Update(currentUserProfile);
            _context.Profiles.Update(targetUser);

            await _context.SaveChangesAsync();

            return Ok(new FollowResponse
            {
                IsFollowing = true,
                FollowersCount = targetUser.FollowersCount
            });
        }

        /// <summary>
        /// Unfollow a user.
        /// Frontend calls: DELETE /api/follow/{userIdToUnfollow}
        /// Returns: unfollow confirmation + updated follower count
        /// </summary>
        [HttpDelete("{userIdToUnfollow}")]
        [Authorize]
        public async Task<ActionResult<FollowResponse>> UnfollowUser(int userIdToUnfollow)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized();
            }

            // Find and delete follow relationship
            var follow = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == userIdToUnfollow);

            if (follow == null)
            {
                return NotFound(new { message = "You don't follow this user" });
            }

            _context.Follows.Remove(follow);

            // Update counts
            var currentUserProfile = await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == currentUserId);

            var targetUserProfile = await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userIdToUnfollow);

            if (currentUserProfile != null)
            {
                currentUserProfile.FollowingCount = Math.Max(0, currentUserProfile.FollowingCount - 1);
                _context.Profiles.Update(currentUserProfile);
            }

            if (targetUserProfile != null)
            {
                targetUserProfile.FollowersCount = Math.Max(0, targetUserProfile.FollowersCount - 1);
                _context.Profiles.Update(targetUserProfile);
            }

            await _context.SaveChangesAsync();

            return Ok(new FollowResponse
            {
                IsFollowing = false,
                FollowersCount = targetUserProfile?.FollowersCount ?? 0
            });
        }

        /// <summary>
        /// Check if current user follows a specific user.
        /// Frontend calls: GET /api/follow/{userId}/following
        /// Returns: true/false
        /// </summary>
        [HttpGet("{userId}/following")]
        [Authorize]
        public async Task<ActionResult<FollowResponse>> IsFollowing(int userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized();
            }

            var follow = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);

            var targetUserProfile = await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return Ok(new FollowResponse
            {
                IsFollowing = follow != null,
                FollowersCount = targetUserProfile?.FollowersCount ?? 0
            });
        }

        /// <summary>
        /// Get list of followers for a user.
        /// Frontend calls: GET /api/follow/{userId}/followers?page=1
        /// Returns: paginated list of followers
        /// </summary>
        [HttpGet("{userId}/followers")]
        public async Task<ActionResult<List<UserDto>>> GetFollowers(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            page = Math.Max(1, page);
            pageSize = Math.Min(50, Math.Max(1, pageSize));

            var followers = await _context.Follows
                .Where(f => f.FollowingId == userId)
                .Include(f => f.Follower)
                .ThenInclude(p => p!.User)
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var users = followers.Select(f => new UserDto
            {
                Id = f.Follower!.User!.Id,
                Username = f.Follower.User.Username,
                Profile = new ProfileDto
                {
                    Id = f.Follower.Id,
                    Name = f.Follower.Name,
                    AvatarUrl = f.Follower.AvatarUrl,
                    FollowersCount = f.Follower.FollowersCount,
                    FollowingCount = f.Follower.FollowingCount,
                    PostsCount = f.Follower.PostsCount
                }
            }).ToList();

            return Ok(users);
        }

        /// <summary>
        /// Get list of users that a user is following.
        /// Frontend calls: GET /api/follow/{userId}/following-list?page=1
        /// Returns: paginated list of followed users
        /// </summary>
        [HttpGet("{userId}/following-list")]
        public async Task<ActionResult<List<UserDto>>> GetFollowing(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            page = Math.Max(1, page);
            pageSize = Math.Min(50, Math.Max(1, pageSize));

            var following = await _context.Follows
                .Where(f => f.FollowerId == userId)
                .Include(f => f.Following)
                .ThenInclude(p => p!.User)
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var users = following.Select(f => new UserDto
            {
                Id = f.Following!.User!.Id,
                Username = f.Following.User.Username,
                Profile = new ProfileDto
                {
                    Id = f.Following.Id,
                    Name = f.Following.Name,
                    AvatarUrl = f.Following.AvatarUrl,
                    FollowersCount = f.Following.FollowersCount,
                    FollowingCount = f.Following.FollowingCount,
                    PostsCount = f.Following.PostsCount
                }
            }).ToList();

            return Ok(users);
        }

        // ========== HELPER METHODS ==========

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
