# AI Experiment Platform

An educational web application for students and teachers to experiment with machine learning models. The platform allows students to upload datasets, train models, and make real-time predictions while teachers can monitor progress and provide feedback.

## Features

- User authentication (student and teacher roles)
- Dataset upload and visualization
- Model training with simple and multiple linear regression
- Real-time predictions with interactive sliders
- Feature importance visualization
- Performance metrics and model interpretation
- Teacher feedback system

## Technology Stack

- React for the frontend
- React Router for navigation
- Tailwind CSS for styling
- Chart.js for data visualization
- ML-Regression-Simple-Linear and ML-Matrix for machine learning algorithms
- LocalStorage for data persistence (no backend required)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Start the development server
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For First-Time Users

1. Register a teacher account first
2. Then register student accounts (students need to select a teacher during registration)
3. Use the sample datasets in the `public` folder for initial testing:
   - `sample-housing.csv` - A comprehensive housing dataset with 6 features

### For Students

1. Upload a dataset (CSV format with headers)
2. Train a model using the uploaded dataset
   - Select a target column (what to predict)
   - Select 1-6 feature columns (what to use for prediction)
   - For optimal educational value, 3-6 features are recommended
3. Make predictions using the interactive sliders
4. View model performance metrics, coefficients, and feature importance visualizations

### For Teachers

1. View all student models in the dashboard
2. Provide feedback on student models
3. Monitor student progress

## Educational Value

This platform is designed with a focus on educational value:

- Easily compare the impact of different features on predictions
- Visualize feature importance and understand coefficients
- See real-time updates as feature values change
- Understand the mathematical representation of the model
- Learn about key concepts like R², MSE, and coefficients

## Development

- The project uses React contexts for state management
- Authentication is handled via localStorage
- All data is stored locally in the browser (no backend required)
- Simple linear regression is used for single-feature models
- Multiple linear regression is implemented using the ML-Matrix library

## License

This project is available for educational purposes only. 