# News Website Backend

A professional Node.js/Express backend API for a modern news website with MongoDB database.

## Features

- ✅ RESTful API architecture
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (User/Admin)
- ✅ Image upload with Cloudinary
- ✅ Email notifications with NodeMailer
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security with Helmet
- ✅ Request logging with Morgan

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Image Storage:** Cloudinary
- **Email:** NodeMailer
- **Validation:** express-validator
- **Security:** Helmet, CORS
- **Rate Limiting:** express-rate-limit

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 9.0.0
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)

## Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file:**

   **MongoDB:**
   - If using local MongoDB: `mongodb://localhost:27017/news_website`
   - If using MongoDB Atlas: Get connection string from Atlas dashboard

   **JWT Secrets:**
   - Generate strong secrets (min 32 characters)
   - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

   **Cloudinary:**
   - Sign up at https://cloudinary.com
   - Get Cloud Name, API Key, and API Secret from dashboard

   **Gmail (for emails):**
   - Enable 2-factor authentication on your Gmail
   - Generate app password: https://myaccount.google.com/apppasswords
   - Use the generated password in EMAIL_PASSWORD

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "username": "johndoe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Article Endpoints

#### Get All Articles
```http
GET /api/articles?page=1&limit=10&category=ID&tag=ID&search=keyword
```

#### Get Single Article
```http
GET /api/articles/:slug
```

#### Create Article (Admin/Author)
```http
POST /api/articles
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "title": "Article Title",
  "content": "Article content here...",
  "category": "category_id",
  "tags": ["tag_id1", "tag_id2"],
  "status": "published",
  "featured_image": <file>
}
```

### Category Endpoints

#### Get All Categories
```http
GET /api/categories
```

#### Create Category (Admin)
```http
POST /api/categories
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Technology",
  "description": "Tech news and updates",
  "color": "#3B82F6"
}
```

### Comment Endpoints

#### Get Article Comments
```http
GET /api/comments/article/:articleId
```

#### Create Comment
```http
POST /api/comments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "Great article!",
  "article": "article_id"
}
```

### Bookmark Endpoints

#### Get User Bookmarks
```http
GET /api/bookmarks
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Toggle Bookmark
```http
POST /api/bookmarks/:articleId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Newsletter Endpoints

#### Subscribe
```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   ├── env.js            # Environment variables
│   │   └── cloudinary.js     # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── articleController.js
│   │   ├── categoryController.js
│   │   ├── tagController.js
│   │   ├── commentController.js
│   │   ├── bookmarkController.js
│   │   ├── newsletterController.js
│   │   ├── userController.js
│   │   └── siteSettingsController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── validator.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Article.js
│   │   ├── Category.js
│   │   ├── Tag.js
│   │   ├── Comment.js
│   │   ├── Bookmark.js
│   │   ├── Newsletter.js
│   │   └── SiteSettings.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── articleRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── bookmarkRoutes.js
│   │   ├── newsletterRoutes.js
│   │   ├── userRoutes.js
│   │   └── siteSettingsRoutes.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── imageUpload.js
│   │   ├── pagination.js
│   │   └── validation.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── articleValidator.js
│   │   ├── categoryValidator.js
│   │   ├── tagValidator.js
│   │   └── commentValidator.js
│   ├── app.js               # Express app configuration
│   └── index.js             # Server entry point
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Database Models

### User
- email, password, full_name, username
- role (user/admin)
- avatar_url, bio
- JWT refresh tokens
- Password reset tokens

### Article
- title, slug, content, excerpt
- featured_image
- author (ref: User)
- category (ref: Category)
- tags (ref: Tag[])
- status (draft/published/archived)
- views, reading_time
- isFeatured, isBreakingNews
- SEO fields

### Category
- name, slug, description
- color, icon
- parent_category (for nested categories)

### Tag
- name, slug, description
- color

### Comment
- content
- article (ref: Article)
- user (ref: User)
- parent_comment (for replies)
- likes, isApproved

### Bookmark
- user (ref: User)
- article (ref: Article)

### Newsletter
- email
- isSubscribed, subscribedAt

### SiteSettings
- site_name, site_description
- social_links
- SEO settings
- features (enable/disable comments, newsletter, etc.)

## Security Features

- **Password Hashing:** bcryptjs
- **JWT Authentication:** Access & refresh tokens
- **Input Validation:** express-validator
- **Rate Limiting:** Prevent brute force attacks
- **CORS:** Configured for specific origins
- **Helmet:** Security headers
- **NoSQL Injection:** Protected by Mongoose sanitization

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "status": 400,
  "message": "Error message here",
  "errors": []
}
```

## Development

### Create Admin User

After starting the server, you can create an admin user by:

1. Register a new user via `/api/auth/register`
2. Manually update the user's role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

Or use MongoDB Compass/Atlas to update the role field.

## Deployment

### Environment Variables for Production

1. Set `NODE_ENV=production`
2. Use strong JWT secrets (32+ characters)
3. Configure MongoDB Atlas connection string
4. Set up Cloudinary for production
5. Configure production email service
6. Update FRONTEND_URL to production domain

### Recommended Hosting

- **API:** Heroku, Railway, Render, DigitalOcean
- **Database:** MongoDB Atlas
- **Images:** Cloudinary

## License

ISC

## Author

Your Name

## Support

For issues and questions, please create an issue in the repository.
