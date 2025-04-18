# Datasets for Linear Regression Learning

This folder contains several datasets designed for teaching linear regression concepts.

## Dataset Overview

1. **sample-data.csv** - Basic housing dataset with few rows (not recommended for multiple linear regression)
2. **sample-housing.csv** - Extended housing dataset (may cause matrix inversion issues with many features)
3. **housing-enhanced.csv** - Expanded housing dataset with 50 samples (better for multiple features)
4. **real-estate-uncorrelated.csv** - Dataset with less correlated features for better multiple regression
5. **student-friendly-dataset.csv** - Student performance dataset ideal for learning multiple regression

## How to Avoid Matrix Inversion Errors

When using multiple linear regression, you may encounter this error:
```
Error training model: Failed to train model: Could not invert the matrix. Try with different features or more samples, or features that are less correlated with each other.
```

This happens because:

1. **Multicollinearity**: When features are highly correlated (like bedrooms & bathrooms)
2. **Insufficient data**: Need at least 3-5 samples per feature (10+ is better)
3. **Feature scaling issues**: Large differences in feature scales

## Recommended Approach

### For Simple Linear Regression:
- Use any dataset with 1 feature and 1 target column
- Example: `square_feet` → `price`

### For Multiple Linear Regression:
- Start with `student-friendly-dataset.csv` or `real-estate-uncorrelated.csv`
- Choose fewer features (2-3) initially
- Use at least 10 samples per feature
- Avoid highly correlated features

### Advanced Tips:
- The system uses regularization to help with matrix inversion
- Features should ideally have different patterns of relationship with the target
- More data always helps overcome matrix inversion issues

## Example Feature Combinations That Work Well

- `study_hours` + `sleep_quality` → `exam_score`
- `square_feet` + `distance_to_city` → `price`
- `square_feet` + `age_years` → `price`

## Features to Avoid Using Together

Highly correlated pairs:
- `bedrooms` + `bathrooms`
- `square_feet` + `bedrooms`
- `distance_to_city` + `crime_rate` 