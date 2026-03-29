# Nutria API Backend - Complete Documentation

## 🎯 Overview

The Nutria Backend is a .NET 9 REST API built with ASP.NET Core that powers your social media health/nutrition app. It handles user authentication, posts, comments, likes, follows, and daily goals.

### Technology Stack
- **Framework**: ASP.NET Core 9
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Entity Framework Core 9
- **Language**: C# 12

---

## 🏗️ Architecture

### Project Structure
```
NutriaAPI/
├── Controllers/        # HTTP endpoints (the "doors" to the API)
│   ├── AuthController.cs          # Login/Register
│   ├── ProfileController.cs       # User profiles & goals
│   ├── PostsController.cs         # Create/read posts
│   ├── InteractionsController.cs  # Likes & comments
│   └── FollowController.cs        # Follow system
├── Data/
│   └── NutriaDbContext.cs        # Database configuration
├── Models/
│   └── Models.cs                 # Database tables (User, Post, Profile, etc)
├── Services/
│   └── AuthService.cs            # Authentication logic (JWT, password hashing)
├── DTOs/
│   └── DTOs.cs                   # Data shapes for API responses
├── Program.cs                    # Application startup configuration
├── appsettings.json              # Database connection & secrets
└── NutriaAPI.csproj             # Project configuration
```

### How Data Flows

```
Client (React Native App)
    ↓
HTTP Request (e.g., POST /api/auth/login)
    ↓
Controller (AuthController.Login)
    ↓
Service (AuthService.VerifyPassword)
    ↓
DbContext (reads/writes to database)
    ↓
MySQL Database
    ↓
(Response returns back through same chain)
```

---

## 📊 Database Models Explained

### 1. **User** (Identity)
Represents a user account. Each person has ONE user account.
```csharp
- Id              → Unique identifier
- Email           → Login email
- Username        → Display name (@username)
- PasswordHash    → Encrypted password (never stored plain!)
- CreatedAt       → Account creation date
```

### 2. **Profile** (Public Info)
Each user has ONE profile with public information.
```csharp
- Id              → Unique identifier
- UserId          → Links to User table
- Name            → Display name
- Bio             → User bio/description
- AvatarUrl       → Profile picture URL
- FollowersCount  → How many people follow this user
- FollowingCount  → How many people this user follows
- PostsCount      → How many posts this user made
- Streak          → Consecutive days of posts
```

### 3. **Post** (Content)
A post is a photo + caption shared by a user.
```csharp
- Id              → Unique identifier
- UserId          → Who posted it
- Caption         → Text description
- ImageUrl        → Photo URL (stored on cloud storage)
- LikesCount      → How many people liked it
- CommentsCount   → How many comments
- CreatedAt       → When posted
```

### 4. **Like** (Interaction)
Records that User A liked Post B.
```csharp
- Id              → Unique identifier
- UserId          → Who liked it
- PostId          → Which post
- CreatedAt       → When liked
(Unique constraint: same user can't like same post twice)
```

### 5. **Comment** (Interaction)
Records a comment on a post.
```csharp
- Id              → Unique identifier
- UserId          → Who commented
- PostId          → Which post
- Text            → Comment text
- CreatedAt       → When posted
```

### 6. **Follow** (Relationship)
Records that User A follows User B.
```csharp
- Id              → Unique identifier
- FollowerId      → Who is following
- FollowingId     → Who is being followed
- CreatedAt       → When followed
(Unique constraint: same user can't follow same user twice)
```

### 7. **DailyGoal** (Progress Tracking)
User's daily nutrition/health goals.
```csharp
- Id              → Unique identifier
- UserId          → Who owns this goal
- GoalType        → "Calories" / "Protein" / "Water"
- TargetValue     → Goal value (e.g., 2000 kcal)
- CurrentValue    → Current progress
- Unit            → "kcal" / "g" / "L"
- Date            → Which day
```

---

## 🔐 Authentication Flow

### Registration
```
1. User submits: email, password, username, name
2. Backend checks if email/username already exist
3. Backend hashes password using PBKDF2 (never store plain passwords!)
4. Creates User + Profile record
5. Generates JWT token (valid for 7 days)
6. Returns token to frontend
```

### Login
```
1. User submits: email, password
2. Backend finds user by email
3. Backend verifies password matches hash
4. Generates JWT token
5. Returns token to frontend
```

### Protected Requests
```
1. Frontend includes token in Authorization header: "Bearer <token>"
2. Backend verifies token signature (proves it's real)
3. Extracts UserId from token
4. Proceeds with request
```

### Why JWT?
- **Stateless**: Server doesn't need to store token (scales easily)
- **Signed**: Can't be forged (only server knows the secret key)
- **Expiring**: Token expires in 7 days, force re-login
- **Cross-origin**: Works with mobile, web, any client

---

## 📡 API Endpoints

### Auth Endpoints
```
POST   /api/auth/register          Register new account
POST   /api/auth/login             Login
GET    /api/auth/verify            Verify token (requires auth)
```

### Profile Endpoints
```
GET    /api/profile/username/{username}  Get any user's profile
GET    /api/profile/me               Get current user's profile (requires auth)
PUT    /api/profile/me               Update current user's profile (requires auth)
GET    /api/profile/goals/today      Get today's goals (requires auth)
PUT    /api/profile/goals/{goalId}   Update a goal (requires auth)
```

### Posts Endpoints
```
GET    /api/posts/feed              Get feed (current user's posts + followed users) (requires auth)
POST   /api/posts                   Create post (requires auth)
GET    /api/posts/{postId}          Get specific post
GET    /api/posts/user/{userId}     Get user's posts
DELETE /api/posts/{postId}          Delete post (requires auth, own posts only)
```

### Interactions (Likes & Comments)
```
POST   /api/interactions/likes/{postId}           Like post (requires auth)
DELETE /api/interactions/likes/{postId}           Unlike post (requires auth)
GET    /api/interactions/likes/post/{postId}      Get who liked post

GET    /api/interactions/comments/post/{postId}   Get post comments
POST   /api/interactions/comments/{postId}        Create comment (requires auth)
GET    /api/interactions/comments/{commentId}     Get specific comment
DELETE /api/interactions/comments/{commentId}     Delete comment (requires auth, own only)
```

### Follow Endpoints
```
POST   /api/follow/{userId}               Follow user (requires auth)
DELETE /api/follow/{userId}               Unfollow user (requires auth)
GET    /api/follow/{userId}/following     Check if following (requires auth)
GET    /api/follow/{userId}/followers     Get followers list
GET    /api/follow/{userId}/following-list Get following list
```

---

## 🚀 Setup Instructions

### Prerequisites
- .NET 9 SDK
- MySQL 8.0+
- Visual Studio or VS Code

### 1. Setup Database
```sql
CREATE DATABASE nutria_db;
```

### 2. Update Connection String
Edit `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=nutria_db;User=root;Password=your_password;"
}
```

### 3. Update JWT Secret
Edit `appsettings.json`:
```json
"Jwt": {
  "Secret": "your-secret-key-at-least-32-chars-long",
  "Issuer": "NutriaAPI"
}
```

### 4. Apply Database Migrations
```bash
cd NutriaAPI
dotnet ef database update
```

### 5. Run the API
```bash
dotnet run
```

The API will start at `https://localhost:5001` or `http://localhost:5000`

---

## 📝 Example API Calls

### Register
```bash
curl -X POST https://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "username": "nutriauser",
    "name": "John Doe"
  }'

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "nutriauser",
    "profile": {
      "id": 1,
      "name": "John Doe",
      "bio": "",
      ...
    }
  }
}
```

### Login
```bash
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Create Post (Requires Auth)
```bash
curl -X POST https://localhost:5001/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Healthy lunch!",
    "imageUrl": "https://example.com/photo.jpg"
  }'
```

### Get Feed (Requires Auth)
```bash
curl -X GET "https://localhost:5001/api/posts/feed?page=1&pageSize=10" \
  -H "Authorization: Bearer <token>"
```

### Like Post (Requires Auth)
```bash
curl -X POST https://localhost:5001/api/interactions/likes/123 \
  -H "Authorization: Bearer <token>"
```

---

## 🔍 Key Concepts

### 1. **Pagination**
When fetching feeds or comments, we use pagination:
```
page=1&pageSize=10 → Load items 1-10
page=2&pageSize=10 → Load items 11-20
```
This keeps the app fast and reduces data transfer.

### 2. **DTOs (Data Transfer Objects)**
Never send database models directly to the frontend:
```csharp
// ❌ BAD - exposes password hash
return Ok(user);  // Includes PasswordHash!

// ✅ GOOD - only return safe data
return Ok(new UserDto {
  Id = user.Id,
  Username = user.Username
});
```

### 3. **Relationship Patterns**
```
User (1) → (1) Profile          One-to-one: each user has one profile
Profile (1) → (Many) Posts      One-to-many: user can have many posts
Post (1) → (Many) Likes         One-to-many: post can have many likes
Profile (1) ←→ (Many) Follows   Many-to-many: users follow multiple users
```

### 4. **Authorization**
```csharp
[Authorize]  // Only authenticated users can call this
public void DeletePost(int postId)
{
    int? userId = GetCurrentUserId();  // Extract from JWT token
    if (userId == null) return Unauthorized();
    
    // Check ownership: only post author can delete
    if (post.UserId != userId) return Forbid();
}
```

---

## 🛠️ Next Steps (Future Enhancements)

1. **File Upload Service**
   - Store images on AWS S3 or similar
   - Don't store large files in database

2. **Real-time Features**
   - WebSockets for live notifications
   - When someone likes your post, notify in real-time

3. **Search**
   - Elasticsearch for fast user/post/hashtag search

4. **Analytics**
   - Redis for caching popular posts
   - Track user engagement metrics

5. **Moderation**
   - Report inappropriate content
   - Admin panel to review

6. **Notifications**
   - Push notifications for likes, comments, follows

---

## 📚 Resources

- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/dotnet/api/)
- [Entity Framework Core Docs](https://learn.microsoft.com/en-us/ef/core/)
- [JWT Authentication](https://jwt.io/)
- [MySQL Documentation](https://dev.mysql.com/)

---

## ❓ Troubleshooting

### Connection String Error
**Problem**: "Connection string 'DefaultConnection' not configured"
**Solution**: Update `appsettings.json` with your MySQL credentials

### JWT Token Invalid
**Problem**: "Jwt:Secret not configured"
**Solution**: Make sure `appsettings.json` has a Jwt:Secret value (min 32 chars)

### Database Migrations Failed
**Problem**: "Unable to create objects in the database"
**Solution**: Verify MySQL is running and database exists: `CREATE DATABASE nutria_db;`

---

Made with ❤️ for Nutria App
