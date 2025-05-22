# UMTC Platform

A web-based platform for battery modeling and simulation, available in two versions:
- Full version: Complete platform with database support
- Lightweight version: Simplified version without database dependencies

## Project Structure

```
UMTC-Platform/
├── app/                    # Flask backend application
│   ├── apis/              # API endpoints
│   ├── models/            # Database models
│   └── utils/             # Utility functions
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
├── migrations/            # Alembic database migrations
├── manage.py             # Flask application entry point
│
└── light/                # Lightweight version
    ├── app/              # Flask backend (no database)
    └── frontend/         # React frontend (no database features)
```

## Installation Guide

### Prerequisites

- Python 3.9+
- Node.js (v16 or higher)
- Git
- PostgreSQL (for full version only)

### Full Version Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Kraziyi/UMTC-Platform.git
   cd UMTC-Platform
   ```

2. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   # On Linux/Mac
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Database Setup**
   If you just want to use ligt version, skip all database steps.

   ```bash
   # Create database and user
   psql -U postgres
   CREATE DATABASE umtc;
   CREATE USER umtc_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE umtc TO umtc_user;
   \q
   ```

4. **Environment Configuration**
   Create a `.env` file in the project root:
   ```env
   DATABASE_URI=postgresql://umtc_user:your_password@localhost:5432/umtc
   SECRET_KEY=your_secret_key
   FLASK_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. **Initialize Database**
   ```bash
   flask db upgrade
   ```

6. **Start Backend Server**
   ```bash
   python manage.py runserver
   ```

7. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Lightweight Version Installation

1. **Navigate to Lightweight Directory**
   ```bash
   cd light
   ```

2. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   # On Linux/Mac
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Start Backend Server**
   ```bash
   python manage.py runserver
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Running the Application

### Full Version
1. Start the backend server:
   ```bash
   # From project root
   python manage.py runserver
   ```
   The server will run on http://localhost:5001

2. Start the frontend development server:
   ```bash
   # From frontend directory
   npm start
   ```
   The frontend will run on http://localhost:3000

### Lightweight Version
1. Start the backend server:
   ```bash
   # From light directory
   python manage.py runserver
   ```
   The server will run on http://localhost:5001

2. Start the frontend development server:
   ```bash
   # From light/frontend directory
   npm start
   ```
   The frontend will run on http://localhost:3000

## Features

### Full Version
- User authentication and management
- Database storage for calculations and results
- History tracking
- File upload and management
- Advanced calculation features

### Lightweight Version
- Basic calculation features
- No database dependencies
- Simplified user interface
- Local storage for results
- No user authentication required

## Development

### Backend Development
- Flask-based REST API
- SQLAlchemy ORM for database operations
- Alembic for database migrations
- JWT authentication

### Frontend Development
- React-based single page application
- Material-UI components
- Axios for API communication
- React Router for navigation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in .env file
   - Ensure database and user exist

2. **Port Already in Use**
   - Check if another instance is running
   - Change port in configuration
   - Kill process using the port

3. **Node Modules Issues**
   - Delete node_modules folder
   - Clear npm cache: `npm cache clean --force`
   - Reinstall: `npm install`

4. **Python Virtual Environment Issues**
   - Ensure correct Python version
   - Recreate virtual environment
   - Verify all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 