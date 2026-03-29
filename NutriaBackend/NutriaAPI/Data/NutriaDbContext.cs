using Microsoft.EntityFrameworkCore;
using NutriaAPI.Models;

namespace NutriaAPI.Data
{
    /// <summary>
    /// NutriaDbContext is the bridge between your C# models and the MySQL database.
    /// 
    /// How it works:
    /// 1. When you create a new User object in C#, DbContext tracks it
    /// 2. When you call SaveChangesAsync(), it generates SQL and sends it to MySQL
    /// 3. When you query Users.ToListAsync(), it reads from the database and converts rows to C# objects
    /// 
    /// Think of it as a translator: C# objects ←→ MySQL rows
    /// </summary>
    public class NutriaDbContext : DbContext
    {
        public NutriaDbContext(DbContextOptions<NutriaDbContext> options) : base(options)
        {
        }

        // DbSets represent tables in the database
        public DbSet<User> Users { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<DailyGoal> DailyGoals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User → Profile (one-to-one)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Profile)
                .WithOne(p => p.User)
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Profile → Posts (one-to-many)
            modelBuilder.Entity<Profile>()
                .HasMany(p => p.Posts)
                .WithOne(post => post.Profile)
                .HasForeignKey(post => post.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Follow relationships
            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Follower)
                .WithMany(p => p.FollowedBy)
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Following)
                .WithMany(p => p.Following)
                .HasForeignKey(f => f.FollowingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Post relationships
            modelBuilder.Entity<Post>()
                .HasMany(p => p.Likes)
                .WithOne(l => l.Post)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Post>()
                .HasMany(p => p.Comments)
                .WithOne(c => c.Post)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // Add unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Create a composite index on Follow to prevent duplicate follows
            modelBuilder.Entity<Follow>()
                .HasIndex(f => new { f.FollowerId, f.FollowingId })
                .IsUnique();

            // Create an index on Like to prevent duplicate likes
            modelBuilder.Entity<Like>()
                .HasIndex(l => new { l.UserId, l.PostId })
                .IsUnique();
        }
    }
}
