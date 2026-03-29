namespace NutriaAPI.Models
{
    /// <summary>
    /// Represents a User account in the system.
    /// This is the core identity - each person has one user account.
    /// </summary>
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property - one user has one profile
        public Profile? Profile { get; set; }
    }

    /// <summary>
    /// Represents a User's public profile information.
    /// This includes name, bio, avatar - the stuff followers see.
    /// Has a one-to-one relationship with User (each user has exactly one profile).
    /// </summary>
    public class Profile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int FollowersCount { get; set; } = 0;
        public int FollowingCount { get; set; } = 0;
        public int PostsCount { get; set; } = 0;
        public int Streak { get; set; } = 0;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public User? User { get; set; }
        
        // Navigation properties
        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Follow> FollowedBy { get; set; } = new List<Follow>();  // People following me
        public ICollection<Follow> Following { get; set; } = new List<Follow>();   // People I follow
    }

    /// <summary>
    /// Represents a "Follow" relationship between two users.
    /// If User A follows User B, there's a Follow record with FollowerId=A, FollowingId=B.
    /// </summary>
    public class Follow
    {
        public int Id { get; set; }
        public int FollowerId { get; set; }        // The person doing the following
        public int FollowingId { get; set; }       // The person being followed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Profile? Follower { get; set; }
        public Profile? Following { get; set; }
    }

    /// <summary>
    /// Represents a Post (photo + caption) shared by a user.
    /// Users post food photos with descriptions and health/nutrition info.
    /// </summary>
    public class Post
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Caption { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int LikesCount { get; set; } = 0;
        public int CommentsCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public Profile? Profile { get; set; }
        
        // Navigation properties
        public ICollection<Like> Likes { get; set; } = new List<Like>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }

    /// <summary>
    /// Represents a user "liking" a post.
    /// If User A likes Post B, there's a Like record.
    /// </summary>
    public class Like
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PostId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public Profile? User { get; set; }
        public Post? Post { get; set; }
    }

    /// <summary>
    /// Represents a comment on a post.
    /// Users can comment on other users' posts with text.
    /// </summary>
    public class Comment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PostId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public Profile? User { get; set; }
        public Post? Post { get; set; }
    }

    /// <summary>
    /// Represents a daily goal/progress tracker.
    /// Users have goals like "1800 calories per day" and log their progress.
    /// </summary>
    public class DailyGoal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string GoalType { get; set; } = string.Empty;  // "Calories", "Protein", "Water"
        public float TargetValue { get; set; }
        public float CurrentValue { get; set; }
        public string Unit { get; set; } = string.Empty;      // "kcal", "g", "L"
        public DateTime Date { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public Profile? Profile { get; set; }
    }
}
