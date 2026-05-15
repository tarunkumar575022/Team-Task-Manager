# TeamFlow - Backend

The backend of TeamFlow is a robust Express.js server providing a RESTful API for task management and authentication.

## 🚀 Features
- **JWT Authentication**: Secure user login and signup.
- **Role-Based Protection**: Middleware to restrict access based on user roles.
- **Task & Project APIs**: Complete CRUD operations for workflow management.
- **MongoDB Integration**: Scalable data persistence with Mongoose.

## 🛠️ Scripts
- `npm start`: Starts the server using Node.
- `npm run dev`: Starts the server using Nodemon for development.

## 🔐 Environment Variables
Create a `.env` file with:
- `PORT`: Server port (default: 5000).
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for token signing.
