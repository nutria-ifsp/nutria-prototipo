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
    public class PostsController : ControllerBase
    {
        private readonly NutriaDbContext _context;

        public PostsController(NutriaDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get feed for the current user (posts from followed accounts + own posts).
        /// Frontend calls: GET /api/posts/feed?page=1&pageSize=10
        /// Returns: paginated list of posts
        /// 
        /// Pagination: Instead of loading all 10,000 posts at once, we load 10 per request.
        /// This keeps the app fast and reduces data transfer.
        /// </summary>
        [HttpGet("feed")]
        [Authorize]
        public async Task<ActionResult<FeedResponse>> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            // Validate pagination
            page = Math.Max(1, page);
            pageSize = Math.Min(50, Math.Max(1, pageSize));

            // Get list of users the current user follows (including self)
            var followedUserIds = await _context.Follows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.FollowingId)
                .ToListAsync();

            followedUserIds.Add(userId!.Value); // Include own posts

            // Get posts from followed users, ordered by newest first
            var totalCount = await _context.Posts
                .Where(p => followedUserIds.Contains(p.UserId))
                .CountAsync();

            var posts = await _context.Posts
                .Where(p => followedUserIds.Contains(p.UserId))
                .Include(p => p.Profile)
                .ThenInclude(pr => pr!.User)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Check which posts the current user has liked
            var likedPostIds = await _context.Likes
                .Where(l => l.UserId == userId && posts.Select(p => p.Id).Contains(l.PostId))
                .Select(l => l.PostId)
                .ToListAsync();

            var postDtos = posts.Select(p => new PostDto
            {
                Id = p.Id,
                Caption = p.Caption,
                ImageUrl = p.ImageUrl,
                LikesCount = p.LikesCount,
                CommentsCount = p.CommentsCount,
                CreatedAt = p.CreatedAt,
                IsLikedByCurrentUser = likedPostIds.Contains(p.Id),
                Author = p.Profile?.User != null ? new UserDto
                {
                    Id = p.Profile.User.Id,
                    Username = p.Profile.User.Username,
                    Profile = new ProfileDto
                    {
                        Id = p.Profile.Id,
                        Name = p.Profile.Name,
                        Bio = p.Profile.Bio,
                        AvatarUrl = p.Profile.AvatarUrl,
                        FollowersCount = p.Profile.FollowersCount,
                        FollowingCount = p.Profile.FollowingCount,
                        PostsCount = p.Profile.PostsCount,
                        Streak = p.Profile.Streak
                    }
                } : null
            }).ToList();

            return Ok(new FeedResponse
            {
                Posts = postDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Get posts from a specific user.
        /// Frontend calls: GET /api/posts/user/{userId}?page=1
        /// Returns: paginated list of user's posts
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<FeedResponse>> GetUserPosts(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            page = Math.Max(1, page);
            pageSize = Math.Min(50, Math.Max(1, pageSize));

            var totalCount = await _context.Posts
                .Where(p => p.UserId == userId)
                .CountAsync();

            var posts = await _context.Posts
                .Where(p => p.UserId == userId)
                .Include(p => p.Profile)
                .ThenInclude(pr => pr!.User)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var postDtos = posts.Select(p => new PostDto
            {
                Id = p.Id,
                Caption = p.Caption,
                ImageUrl = p.ImageUrl,
                LikesCount = p.LikesCount,
                CommentsCount = p.CommentsCount,
                CreatedAt = p.CreatedAt,
                Author = p.Profile?.User != null ? new UserDto
                {
                    Id = p.Profile.User.Id,
                    Username = p.Profile.User.Username
                } : null
            }).ToList();

            return Ok(new FeedResponse
            {
                Posts = postDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Create a new post.
        /// Frontend calls: POST /api/posts
        /// Body: { caption, imageUrl }
        /// Returns: created post
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PostDto>> CreatePost([FromBody] CreatePostRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.Caption) || string.IsNullOrWhiteSpace(request.ImageUrl))
            {
                return BadRequest(new { message = "Caption and image URL are required" });
            }

            var profile = await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return NotFound(new { message = "Profile not found" });
            }

            var post = new Post
            {
                UserId = userId!.Value,
                Caption = request.Caption,
                ImageUrl = request.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);

            // Update user's post count
            profile.PostsCount += 1;
            _context.Profiles.Update(profile);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPost), new { postId = post.Id }, new PostDto
            {
                Id = post.Id,
                Caption = post.Caption,
                ImageUrl = post.ImageUrl,
                LikesCount = 0,
                CommentsCount = 0,
                CreatedAt = post.CreatedAt
            });
        }

        /// <summary>
        /// Get a single post by ID.
        /// Frontend calls: GET /api/posts/{postId}
        /// Returns: post with all details
        /// </summary>
        [HttpGet("{postId}")]
        public async Task<ActionResult<PostDto>> GetPost(int postId)
        {
            var post = await _context.Posts
                .Include(p => p.Profile)
                .ThenInclude(pr => pr!.User)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
            {
                return NotFound();
            }

            return Ok(new PostDto
            {
                Id = post.Id,
                Caption = post.Caption,
                ImageUrl = post.ImageUrl,
                LikesCount = post.LikesCount,
                CommentsCount = post.CommentsCount,
                CreatedAt = post.CreatedAt,
                Author = post.Profile?.User != null ? new UserDto
                {
                    Id = post.Profile.User.Id,
                    Username = post.Profile.User.Username,
                    Profile = new ProfileDto
                    {
                        Id = post.Profile.Id,
                        Name = post.Profile.Name,
                        Bio = post.Profile.Bio,
                        AvatarUrl = post.Profile.AvatarUrl
                    }
                } : null
            });
        }

        /// <summary>
        /// Delete a post (only post author can delete).
        /// Frontend calls: DELETE /api/posts/{postId}
        /// Returns: success message
        /// </summary>
        [HttpDelete("{postId}")]
        [Authorize]
        public async Task<ActionResult> DeletePost(int postId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
            {
                return NotFound();
            }

            if (post.UserId != userId)
            {
                return Forbid("You can only delete your own posts");
            }

            var profile = await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile != null)
            {
                profile.PostsCount = Math.Max(0, profile.PostsCount - 1);
                _context.Profiles.Update(profile);
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Post deleted successfully" });
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
