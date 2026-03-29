# Quick Reference Guide - Nutria API

## 🚀 Quick Start

```bash
# 1. Navigate to project
cd NutriaBackend/NutriaAPI

# 2. Restore packages
dotnet restore

# 3. Apply database migration
dotnet ef database update

# 4. Run the API
dotnet run

# API is now available at:
# http://localhost:5000 (HTTP)
# https://localhost:5001 (HTTPS)
```

## 📱 API Endpoints Cheat Sheet

### Authentication
```
POST   /api/auth/register          → Create account
POST   /api/auth/login             → Login
GET    /api/auth/verify            → Verify token (auth required)
```

### Profile
```
GET    /api/profile/me             → Get my profile (auth required)
GET    /api/profile/username/{u}   → Get any user's profile
PUT    /api/profile/me             → Edit my profile (auth required)
GET    /api/profile/goals/today    → Get today's goals (auth required)
PUT    /api/profile/goals/{id}     → Update goal (auth required)
```

### Posts
```
GET    /api/posts/feed             → Get feed (auth required)
POST   /api/posts                  → Create post (auth required)
GET    /api/posts/{id}             → Get post details
GET    /api/posts/user/{userId}    → Get user's posts
DELETE /api/posts/{id}             → Delete post (auth required)
```

### Interactions
```
POST   /api/interactions/likes/{postId}        → Like post (auth required)
DELETE /api/interactions/likes/{postId}        → Unlike post (auth required)
GET    /api/interactions/likes/post/{postId}   → Get post likes

GET    /api/interactions/comments/post/{id}    → Get comments (auth required)
POST   /api/interactions/comments/{postId}     → Create comment (auth required)
GET    /api/interactions/comments/{id}         → Get comment
DELETE /api/interactions/comments/{id}         → Delete comment (auth required)
```

### Follow
```
POST   /api/follow/{userId}               → Follow (auth required)
DELETE /api/follow/{userId}               → Unfollow (auth required)
GET    /api/follow/{userId}/following     → Is following? (auth required)
GET    /api/follow/{userId}/followers     → Get followers list
GET    /api/follow/{userId}/following-list→ Get following list
```

## 🔑 How to Make Requests

### Without Authentication
```bash
curl -X GET "http://localhost:5000/api/profile/username/john"
```

### With Authentication (JWT Token)
```bash
# First get token
TOKEN=$(curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}' \
  | jq -r '.token')

# Then use token in requests
curl -X POST "http://localhost:5000/api/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"caption":"Hello!","imageUrl":"https://..."}'
```

### Using JavaScript/React Native
```typescript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'Pass123' })
});
const { token } = await loginResponse.json();

// Protected request with token
const response = await fetch('http://localhost:5000/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ caption: 'Hello!', imageUrl: 'https://...' })
});
```

## 📊 Database Models Quick View

```
User
├─ id (int)
├─ email (string, unique)
├─ username (string, unique)
├─ passwordHash (string)
└─ profile (Profile)

Profile
├─ id (int)
├─ userId (int)
├─ name (string)
├─ bio (string)
├─ avatarUrl (string)
├─ followersCount (int)
├─ followingCount (int)
├─ postsCount (int)
└─ posts (Post[])

Post
├─ id (int)
├─ userId (int)
├─ caption (string)
├─ imageUrl (string)
├─ likesCount (int)
├─ commentsCount (int)
├─ likes (Like[])
└─ comments (Comment[])

Like
├─ id (int)
├─ userId (int)
├─ postId (int)

Comment
├─ id (int)
├─ userId (int)
├─ postId (int)
├─ text (string)

Follow
├─ id (int)
├─ followerId (int)
├─ followingId (int)

DailyGoal
├─ id (int)
├─ userId (int)
├─ goalType (string)
├─ targetValue (float)
├─ currentValue (float)
├─ unit (string)
└─ date (DateTime)
```

## 🔧 Common Tasks

### Register New User
```json
POST /api/auth/register
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "username": "john_doe",
  "name": "John Doe"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Update Profile
```json
PUT /api/profile/me
Header: Authorization: Bearer <token>

{
  "name": "John Updated",
  "bio": "I love nutrition!",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### Create Post
```json
POST /api/posts
Header: Authorization: Bearer <token>

{
  "caption": "Amazing breakfast!",
  "imageUrl": "https://example.com/breakfast.jpg"
}
```

### Get Feed
```
GET /api/posts/feed?page=1&pageSize=10
Header: Authorization: Bearer <token>

Response: List of 10 posts from followed users
```

### Like a Post
```
POST /api/interactions/likes/42
Header: Authorization: Bearer <token>

Response: { "message": "Post liked", "likesCount": 48 }
```

### Add Comment
```json
POST /api/interactions/comments/42
Header: Authorization: Bearer <token>

{
  "text": "Looks delicious!"
}

Response: Comment object
```

### Follow User
```
POST /api/follow/5
Header: Authorization: Bearer <token>

Response: { "isFollowing": true, "followersCount": 234 }
```

## ⚙️ Configuration

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=nutria_db;User=root;Password=your_password;"
  },
  "Jwt": {
    "Secret": "your-secret-key-minimum-32-characters-long",
    "Issuer": "NutriaAPI"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Change These Before Production
- `Jwt:Secret` - Use a strong random key
- `ConnectionStrings:DefaultConnection` - Your production MySQL server
- `Logging` - Set to "Warning" in production

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | MySQL not running. Start MySQL service |
| "JWT:Secret not configured" | Add `Jwt:Secret` to appsettings.json |
| "Database does not exist" | Run `dotnet ef database update` |
| "401 Unauthorized" | Token is missing or expired. Re-login |
| "403 Forbidden" | You don't own this resource (e.g., can't delete someone else's post) |
| "404 Not Found" | Resource doesn't exist (bad ID) |
| "400 Bad Request" | Validation error. Check request body |

## 📚 Useful Commands

```bash
# Create new migration after changing models
dotnet ef migrations add MigrationName

# See pending migrations
dotnet ef migrations list

# Update database to latest migration
dotnet ef database update

# Revert to previous migration
dotnet ef database update PreviousMigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove

# Run API with watch mode (auto-restart on changes)
dotnet watch run

# Build release version
dotnet publish -c Release

# Run tests (if you add tests)
dotnet test
```

## 📖 Learn More

- [API Documentation](./README.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [ASP.NET Core Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)

---

**Version**: 1.0  
**Last Updated**: March 2024  
**Status**: Production Ready ✅
