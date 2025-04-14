# Sample Datasets

This directory contains sample datasets that can be used for testing and demonstration purposes in the AI Experiments System.

## Available Datasets

### Iris Dataset (iris_dataset.csv)

A classic dataset for classification problems, particularly for beginners in machine learning.

- **Features**: 
  - sepal_length: Length of the sepal (in cm)
  - sepal_width: Width of the sepal (in cm)
  - petal_length: Length of the petal (in cm)
  - petal_width: Width of the petal (in cm)
- **Target**: 
  - species: The species of iris (0 = setosa, 1 = versicolor, 2 = virginica)

This dataset can be used with all model types in the system:
- Perceptron
- Logistic Regression
- Neural Network

### Housing Dataset (housing_dataset.csv)

A simplified dataset for regression problems, predicting house prices based on various features.

- **Features**:
  - area: Size of the house in square feet
  - bedrooms: Number of bedrooms
  - bathrooms: Number of bathrooms
  - age: Age of the house in years
  - garage: Number of garage spaces
  - distance_to_city: Distance to city center in miles
- **Target**:
  - price: House price in USD

This dataset is ideal for:
- Linear Regression
- Neural Network (regression)

## How to Use

1. Download the desired CSV file
2. Upload it through the "Upload Dataset" feature in the application
3. Select appropriate columns for features and target when training models 