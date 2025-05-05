# UMTC Platform Documentation

## Table of Contents
1. [Installation Guide](#installation-guide)
   - [Windows Installation](#windows-installation)
   - [Linux Installation](#linux-installation)
2. [Development Guide](#development-guide)
   - [Project Structure](#project-structure)
   - [Backend Architecture](#backend-architecture)
   - [Frontend Architecture](#frontend-architecture)
   - [API Documentation](#api-documentation)

## Installation Guide

### Windows Installation

#### Prerequisites
- Windows 10+ or later
- Python 3.9+
- Git
- Node.js (v16 or higher)
- PostgreSQL

#### Installation Steps

1. **Install Required Tools**
   - [Git](https://git-scm.com/downloads/win)
   - [Python](https://www.python.org/downloads/windows/)
   - [Node.js](https://nodejs.org/)
   - [PostgreSQL](https://www.postgresql.org/download/windows/)

2. **Clone the Repository**
   ```bash
   git clone https://github.com/Kraziyi/UMTC-Platform.git
   cd UMTC-Platform
   ```

3. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Database Setup**
   ```bash
   # Create database and user
   psql -U postgres
   CREATE DATABASE umtc;
   CREATE USER umtc_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE umtc TO umtc_user;
   ```

5. **Environment Configuration**
   Create a `.env` file in the project root:
   ```env
   DATABASE_URI=postgresql://umtc_user:your_password@localhost:5432/umtc
   SECRET_KEY=your_secret_key
   FLASK_ENV=development
   FRONTEND_URL=http://localhost:3000
   MAIL_USERNAME=your_email@gmail.com
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_DEFAULT_SENDER=no-reply@gmail.com
   MAIL_PASSWORD=your_password
   ```

6. **Run Migrations**
   ```bash
   flask db upgrade
   ```

7. **Start the Backend**
   ```bash
   python manage.py runserver
   ```

8. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Linux Installation

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Python 3.9+
- Git
- Node.js (v16 or higher)
- PostgreSQL

#### Installation Steps

1. **Install Required Tools**
   ```bash
   # Update package lists
   sudo apt update

   # Install Python and pip
   sudo apt install python3 python3-pip python3-venv

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   ```

2. **Clone the Repository**
   ```bash
   git clone https://github.com/Kraziyi/UMTC-Platform.git
   cd UMTC-Platform
   ```

3. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python3 -m venv venv
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Database Setup**
   ```bash
   # Switch to postgres user
   sudo -i -u postgres

   # Create database and user
   psql
   CREATE DATABASE umtc;
   CREATE USER umtc_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE umtc TO umtc_user;
   \q
   exit
   ```

5. **Environment Configuration**
   Create a `.env` file in the project root (same as Windows configuration)

6. **Run Migrations and Start Services**
   ```bash
   flask db upgrade
   python manage.py runserver
   ```

7. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Development Guide

### Project Structure

```
UMTC-Platform/
├── app/                    # Backend Flask application
│   ├── apis/              # API endpoints
│   │   ├── admin.py       # Admin-related APIs
│   │   ├── calculation.py # Calculation APIs
│   │   ├── history.py     # History management APIs
│   │   ├── upload.py      # File upload APIs
│   │   └── user.py        # User management APIs
│   ├── models/            # Database models
│   │   ├── folder.py      # Folder model
│   │   ├── history.py     # History model
│   │   └── user.py        # User model
│   └── utils/             # Utility functions
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.js        # Main application
└── docs/                  # Documentation
```

### Backend Architecture

The backend is built using Flask and follows a modular structure:

1. **Models**
   - `User`: Handles user authentication and profile management
   - `History`: Manages calculation history and results
   - `Folder`: Organizes calculations into folders

2. **APIs**
   - User Management (`/api/user/*`)
   - Calculation Services (`/api/calculation/*`)
   - History Management (`/api/history/*`)
   - File Upload (`/api/upload/*`)
   - Admin Functions (`/api/admin/*`)

3. **Authentication**
   - JWT-based authentication
   - Role-based access control (Admin/User)

### Frontend Architecture

The frontend is built using React and follows a component-based architecture:

1. **Pages**
   - Authentication (Login, Register)
   - User Management
   - Calculation Interface
   - History Management
   - File Upload
   - Admin Dashboard

2. **Services**
   - API integration
   - Authentication handling
   - State management

3. **Components**
   - Reusable UI components
   - Form components
   - Navigation components

### API Documentation

#### User Management
- `POST /api/user/login` - User login
- `POST /api/user/register` - User registration
- `GET /api/user/info/current` - Get current user info
- `POST /api/user/subscription` - Manage subscriptions

#### Calculation Services
- `POST /api/calculation/diffusion` - Run diffusion calculation
- `POST /api/calculation/diffusion_2d` - Run 2D diffusion calculation
- `POST /api/calculation/ecm` - Run ECM calculation
- `POST /api/calculation/uploaded` - Upload custom calculation functions

#### History Management
- `GET /api/history/folders` - Get folders
- `POST /api/history/folders` - Create folder
- `GET /api/history` - Get calculation history
- `DELETE /api/history/{id}` - Delete history item

#### File Management
- `POST /api/upload` - Upload files
- `GET /api/calculation/uploaded` - Get uploaded functions
- `PUT /api/calculation/uploaded/visibility` - Update function visibility

### Development Workflow

1. **Setting Up Development Environment**
   - Follow installation guide
   - Create feature branch
   - Install development dependencies

2. **Making Changes**
   - Backend changes:
     - Update models if needed
     - Add/update API endpoints
     - Create/update database migrations
   - Frontend changes:
     - Add/update components
     - Update API services
     - Add/update pages

3. **Testing**
   - Run backend tests
   - Test frontend components
   - Verify API endpoints
   - Check database migrations

4. **Deployment**
   - Update version numbers
   - Run migrations
   - Build frontend
   - Deploy to production

### Best Practices

1. **Code Style**
   - Follow PEP 8 for Python
   - Use ESLint for JavaScript
   - Write meaningful commit messages

2. **Security**
   - Never commit sensitive data
   - Use environment variables
   - Implement proper authentication
   - Validate all inputs

3. **Performance**
   - Optimize database queries
   - Use proper indexing
   - Implement caching where needed
   - Minimize API calls

4. **Documentation**
   - Update API documentation
   - Add code comments
   - Keep README up to date
   - Document database changes 