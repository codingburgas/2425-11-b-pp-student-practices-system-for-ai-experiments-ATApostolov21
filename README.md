# AI Experiment Platform

A comprehensive educational platform designed for students and teachers to experiment with machine learning models. This platform enables users to upload datasets, train various ML algorithms, make predictions, and understand model behavior through visualizations and detailed analytics.

## Features

- **User Authentication**
  - Separate roles for students and teachers
  - Secure login and authentication flow

- **Dataset Management**
  - Upload and manage CSV datasets
  - View dataset statistics and visualizations
  - Analyze data distributions and correlations

- **Model Training**
  - Support for multiple algorithms:
    - Linear Regression
    - Random Forest Regression
    - Logistic Classification
    - Random Forest Classification
  - Configurable training parameters
  - Automatic test/train split

- **Model Analysis**
  - Performance metrics (R², MSE, Accuracy, F1 Score)
  - Feature importance visualization
  - Model equation display
  - Interactive feature contribution analysis

- **Prediction Interface**
  - Make individual predictions with visual explanations
  - Batch predictions via CSV upload
  - Real-time updates showing how input changes affect predictions

- **Educational Features**
  - Teacher feedback system on student models
  - Detailed explanations of model behavior
  - Key insights highlighting important features

- **API Access**
  - Programmatic access to models
  - Endpoints for model listing and predictions

## Tech Stack

- **Backend**: Flask (Python web framework)
- **Database**: SQLAlchemy ORM with SQLite
- **Machine Learning**: scikit-learn, pandas, numpy
- **Frontend**: TailwindCSS, HTML templates with Jinja2
- **Authentication**: Flask-Login
- **Forms**: Flask-WTF

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd ai_experiment_platform
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

5. Run the application:
```bash
flask run
```

6. Access the application at [http://localhost:5000](http://localhost:5000)

## Project Structure

```
ai_experiment_platform/
├── app/
│   ├── __init__.py        # Application factory
│   ├── extensions.py      # Flask extensions
│   ├── static/            # Static files
│   │   ├── datasets/      # Uploaded datasets
│   │   └── models/        # Saved ML models
│   ├── templates/         # Global templates
│   ├── auth/              # Authentication blueprint
│   ├── main/              # Main blueprint (home, dashboard)
│   ├── datasets/          # Dataset management blueprint
│   ├── models/            # ML Models blueprint
│   │   ├── ml_utils.py    # Machine learning utilities
│   │   ├── models.py      # Database models
│   │   ├── forms.py       # Form definitions
│   │   └── routes.py      # Route handlers
│   └── api/               # API blueprint
├── migrations/            # Database migrations
├── instance/              # SQLite database
├── config.py              # Configuration
├── requirements.txt       # Dependencies
└── run.py                 # Application entry point
```

## Feature Contribution Analysis

One of the key educational features of this platform is the Feature Contribution Analysis, which:

- Shows how each feature contributes to the final prediction
- Updates in real-time as users modify input values
- Visually highlights positive and negative contributions
- Identifies the most influential features for each prediction

## API Documentation

The platform provides a RESTful API for programmatic access to models.

### Endpoints

- **GET /api/models**: Get a list of all models for the authenticated user
- **GET /api/models/{id}**: Get details for a specific model
- **POST /api/models/{id}/predict**: Make a prediction using a model

Example request for prediction:
```json
{
  "feature_values": [0.5, 1.2, 3.4]
}
```

## Use Cases

### For Students
- Train models on various datasets to understand ML concepts
- Experiment with different algorithms and parameters
- Visualize how changing input values affects predictions
- Learn from feedback provided by teachers

### For Teachers
- Create example models for educational purposes
- Review student-created models and provide feedback
- Monitor student progress and understanding
- Demonstrate ML concepts with interactive examples

## License

[MIT License](LICENSE)
