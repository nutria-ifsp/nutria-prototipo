namespace NutriaAPI.DTOs
{
    // ============= AUTH DTOs =============
    
    /// <summary>
    /// What the frontend sends when registering: email, password, username
    /// </summary>
    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>
    /// What the frontend sends when logging in: email and password
    /// </summary>
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// What the API returns after successful login: JWT token and user info
    /// JWT is a secure token that proves the user is logged in
    /// </summary>
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = new();
    }

    // ============= USER DTOs =============

    /// <summary>
    /// Public user profile information sent to the frontend
    /// Does NOT include sensitive data like email or password
    /// </summary>
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public ProfileDto? Profile { get; set; }
    }

    /// <summary>
    /// Profile information: name, bio, avatar, follower counts
    /// </summary>
    public class ProfileDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public int PostsCount { get; set; }
        public int Streak { get; set; }
    }

    /// <summary>
    /// What the frontend sends to update profile
    /// </summary>
    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }

    // ============= POST DTOs =============

    /// <summary>
    /// What the frontend sends when creating a post
    /// </summary>
    public class CreatePostRequest
    {
        public string Caption { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
    }

    /// <summary>
    /// Post data sent to the frontend (includes author info and stats)
    /// </summary>
    public class PostDto
    {
        public int Id { get; set; }
        public string Caption { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int LikesCount { get; set; }
        public int CommentsCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDto? Author { get; set; }
        public bool IsLikedByCurrentUser { get; set; } = false;
    }

    // ============= COMMENT DTOs =============

    /// <summary>
    /// What the frontend sends when creating a comment
    /// </summary>
    public class CreateCommentRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    /// <summary>
    /// Comment data sent to the frontend
    /// </summary>
    public class CommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public UserDto? Author { get; set; }
    }

    // ============= FOLLOW DTOs =============

    /// <summary>
    /// Response after following/unfollowing a user
    /// </summary>
    public class FollowResponse
    {
        public bool IsFollowing { get; set; }
        public int FollowersCount { get; set; }
    }

    // ============= FEED DTOs =============

    /// <summary>
    /// Feed response with paginated posts
    /// Pagination helps load data efficiently (don't load all 10,000 posts at once!)
    /// </summary>
    public class FeedResponse
    {
        public List<PostDto> Posts { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

    // ============= DAILY GOAL DTOs =============

    /// <summary>
    /// Daily goal (calories, protein, water) for today
    /// </summary>
    public class DailyGoalDto
    {
        public int Id { get; set; }
        public string GoalType { get; set; } = string.Empty;
        public float TargetValue { get; set; }
        public float CurrentValue { get; set; }
        public string Unit { get; set; } = string.Empty;
        public float Progress { get; set; }  // CurrentValue / TargetValue (0.0 to 1.0)
    }

    /// <summary>
    /// What frontend sends to update daily goal progress
    /// </summary>
    public class UpdateDailyGoalRequest
    {
        public float CurrentValue { get; set; }
    }
}
