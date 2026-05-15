# 🚀 TeamFlow - Full-Stack Team Task Manager

TeamFlow is a modern, premium task management application designed for teams to collaborate effectively. It features a robust role-based access control system, real-time analytics, and a sleek, interactive user interface built with the latest technologies.

---

## 🔗 Live Links
- **🌐 Live Demo:** [View Live Site](https://your-live-url.com)
- **📂 Backend API:** [API Endpoint](https://your-api-url.com)

---

![TeamFlow Banner](https://via.placeholder.com/1200x400/1e293b/ffffff?text=TeamFlow+Task+Manager)

## ✨ Key Features

- **🔐 Role-Based Access Control**: Separate portals for Admins and Members with specialized permissions.
- **📊 Interactive Dashboard**: Real-time project statistics and task distribution visualized with Chart.js.
- **📋 Task Board**: Dynamic Kanban-style board for managing task lifecycles (To Do, In Progress, Completed).
- **🏗️ Project Management**: Create, update, and manage multiple projects and their associated tasks seamlessly.
- **🎭 Modern UI/UX**: Premium glassmorphism design with smooth animations powered by Framer Motion.
- **🌓 Dual Theme Support**: Optimized for both Light and Dark modes for better accessibility.
- **📱 Responsive Design**: Fully functional across desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern component-based architecture.
- **Vite**: Ultra-fast build tool and development server.
- **Framer Motion**: For fluid animations and micro-interactions.
- **Chart.js**: Interactive data visualization.
- **Lucide React**: Clean and consistent iconography.
- **Axios**: Secure and efficient API communication.

### Backend
- **Node.js & Express**: High-performance server-side environment.
- **MongoDB & Mongoose**: Flexible NoSQL database with robust object modeling.
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **Bcryptjs**: Advanced password hashing for maximum security.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tarunkumar575022/Team-Task-Manager.git
   cd Team-Task-Manager
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Client Setup**
   ```bash
   cd ../client
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── utils/         # API helpers and utilities
│   │   └── App.jsx        # Main application component
├── server/                # Express Backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth and validation middleware
│   └── index.js           # Server entry point
└── README.md              # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

---
Built with ❤️ by [Tarun Kumar](https://github.com/tarunkumar575022)
