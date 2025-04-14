# System for Experiments with Artificial Intelligence

A web-based system using Flask where students and teachers can create, train, and test simple AI models while practicing database work, result visualization, and using basic algorithms.

## Features

- User authentication with different access levels (students and teachers)
- Upload and manage datasets
- Train various AI models (perceptron, linear regression, logistic regression, neural network)
- Visualize training results 
- Make predictions with trained models
- Share and comment on results

## Setup Instructions

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ai-experiments-system.git
   cd ai-experiments-system
   ```

2. Create and activate a virtual environment
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables
   ```
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. Initialize the database
   ```
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. Run the application
   ```
   flask run
   ```

7. Navigate to http://127.0.0.1:5000 in your browser

## Project Structure

- `/app` - Main application package
  - `/models` - Database models
  - `/routes` - Route handlers
  - `/forms` - Form definitions
  - `/templates` - HTML templates
  - `/static` - Static files (CSS, JS, images)
  - `/utils` - Utility functions and AI implementations

## Technologies Used

- Flask - Web framework
- SQLAlchemy - ORM for database operations
- Flask-Login - User session management
- Scikit-learn - Machine learning algorithms
- Matplotlib/Plotly - Data visualization
- Bootstrap - Frontend styling 