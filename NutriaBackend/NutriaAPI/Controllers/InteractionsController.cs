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
    public class InteractionsController : ControllerBase
    {
        private readonly NutriaDbContext _context;

        public InteractionsController(NutriaDbContext context)
        {
            _context = context;
        }

        // ========== LIKES ==========

        /// <summary>
        /// Like a post.
        /// Frontend calls: POST /api/interactions/likes/{postId}
        /// Returns: success message + updated like count
        /// </summary>
        [HttpPost("likes/{postId}")]
        [Authorize]
        public async Task<ActionResult> LikePost(int postId)
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
                return NotFound(new { message = "Post not found" });
            }

            // Check if already liked
            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.UserId == userId && l.PostId == postId);

            if (existingLike != null)
            {
                return BadRequest(new { message = "You already liked this post" });
            }

            // Create like
            var like = new Like
            {
                UserId = userId!.Value,
                PostId = postId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Likes.Add(like);

            // Update post like count
            post.LikesCount += 1;
            _context.Posts.Update(post);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Post liked", likesCount = post.LikesCount });
        }

        /// <summary>
        /// Unlike a post.
        /// Frontend calls: DELETE /api/interactions/likes/{postId}
        /// Returns: success message + updated like count
        /// </summary>
        [HttpDelete("likes/{postId}")]
        [Authorize]
        public async Task<ActionResult> UnlikePost(int postId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var like = await _context.Likes
                .FirstOrDefaultAsync(l => l.UserId == userId!.Value && l.PostId == postId);

            if (like == null)
            {
                return NotFound(new { message = "Like not found" });
            }

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post != null)
            {
                post.LikesCount = Math.Max(0, post.LikesCount - 1);
                _context.Posts.Update(post);
            }

            _context.Likes.Remove(like);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Post unliked", likesCount = post?.LikesCount ?? 0 });
        }

        /// <summary>
        /// Get all likes on a post.
        /// Frontend calls: GET /api/interactions/likes/post/{postId}
        /// Returns: list of users who liked the post
        /// </summary>
        [HttpGet("likes/post/{postId}")]
        public async Task<ActionResult<List<UserDto>>> GetPostLikes(int postId)
        {
            var likes = await _context.Likes
                .Where(l => l.PostId == postId)
                .Include(l => l.User)
                .ThenInclude(p => p!.User)
                .ToListAsync();

            var users = likes.Select(l => new UserDto
            {
                Id = l.User!.User!.Id,
                Username = l.User.User.Username
            }).ToList();

            return Ok(users);
        }

        // ========== COMMENTS ==========

        /// <summary>
        /// Get all comments on a post.
        /// Frontend calls: GET /api/interactions/comments/post/{postId}?page=1
        /// Returns: paginated list of comments
        /// </summary>
        [HttpGet("comments/post/{postId}")]
        public async Task<ActionResult<List<CommentDto>>> GetPostComments(int postId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            page = Math.Max(1, page);
            pageSize = Math.Min(50, Math.Max(1, pageSize));

            var comments = await _context.Comments
                .Where(c => c.PostId == postId)
                .Include(c => c.User)
                .ThenInclude(p => p!.User)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var commentDtos = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                Author = c.User?.User != null ? new UserDto
                {
                    Id = c.User.User.Id,
                    Username = c.User.User.Username,
                    Profile = new ProfileDto
                    {
                        Id = c.User.Id,
                        Name = c.User.Name,
                        AvatarUrl = c.User.AvatarUrl
                    }
                } : null
            }).ToList();

            return Ok(commentDtos);
        }

        /// <summary>
        /// Create a comment on a post.
        /// Frontend calls: POST /api/interactions/comments/{postId}
        /// Body: { text }
        /// Returns: created comment
        /// </summary>
        [HttpPost("comments/{postId}")]
        [Authorize]
        public async Task<ActionResult<CommentDto>> CreateComment(int postId, [FromBody] CreateCommentRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest(new { message = "Comment text is required" });
            }

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
            {
                return NotFound(new { message = "Post not found" });
            }

            var comment = new Comment
            {
                UserId = userId!.Value,
                PostId = postId,
                Text = request.Text,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);

            // Update post comment count
            post.CommentsCount += 1;
            _context.Posts.Update(post);

            await _context.SaveChangesAsync();

            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return CreatedAtAction(nameof(GetComment), new { commentId = comment.Id }, new CommentDto
            {
                Id = comment.Id,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                Author = profile?.User != null ? new UserDto
                {
                    Id = profile.User.Id,
                    Username = profile.User.Username,
                    Profile = new ProfileDto
                    {
                        Id = profile.Id,
                        Name = profile.Name,
                        AvatarUrl = profile.AvatarUrl
                    }
                } : null
            });
        }

        /// <summary>
        /// Get a single comment.
        /// Frontend calls: GET /api/interactions/comments/{commentId}
        /// Returns: comment details
        /// </summary>
        [HttpGet("comments/{commentId}")]
        public async Task<ActionResult<CommentDto>> GetComment(int commentId)
        {
            var comment = await _context.Comments
                .Include(c => c.User)
                .ThenInclude(p => p!.User)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                return NotFound();
            }

            return Ok(new CommentDto
            {
                Id = comment.Id,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                Author = comment.User?.User != null ? new UserDto
                {
                    Id = comment.User.User.Id,
                    Username = comment.User.User.Username
                } : null
            });
        }

        /// <summary>
        /// Delete a comment (only comment author can delete).
        /// Frontend calls: DELETE /api/interactions/comments/{commentId}
        /// Returns: success message
        /// </summary>
        [HttpDelete("comments/{commentId}")]
        [Authorize]
        public async Task<ActionResult> DeleteComment(int commentId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                return NotFound();
            }

            if (comment.UserId != userId)
            {
                return Forbid("You can only delete your own comments");
            }

            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == comment.PostId);

            if (post != null)
            {
                post.CommentsCount = Math.Max(0, post.CommentsCount - 1);
                _context.Posts.Update(post);
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comment deleted successfully" });
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
