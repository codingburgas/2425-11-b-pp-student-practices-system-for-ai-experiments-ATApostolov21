import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

def plot_confusion_matrix(conf_matrix, class_names=None):
    """
    Plot a confusion matrix
    
    Args:
        conf_matrix: 2D list or array representing the confusion matrix
        class_names: list of class names (optional)
    
    Returns:
        fig: matplotlib figure
    """
    conf_matrix = np.array(conf_matrix)
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Create a colormap
    cax = ax.matshow(conf_matrix, cmap=plt.cm.Blues)
    fig.colorbar(cax)
    
    # Set labels
    if class_names:
        labels = class_names
    else:
        labels = np.arange(conf_matrix.shape[0])
    
    ax.set_xticks(np.arange(len(labels)))
    ax.set_yticks(np.arange(len(labels)))
    ax.set_xticklabels(labels)
    ax.set_yticklabels(labels)
    
    # Display values in the cells
    for i in range(conf_matrix.shape[0]):
        for j in range(conf_matrix.shape[1]):
            ax.text(j, i, str(conf_matrix[i, j]), ha='center', va='center')
    
    ax.set_xlabel('Predicted')
    ax.set_ylabel('True')
    ax.set_title('Confusion Matrix')
    
    return fig

def plot_learning_curve(train_loss, val_loss=None):
    """
    Plot learning curves showing loss over iterations
    
    Args:
        train_loss: list of training loss values
        val_loss: list of validation loss values (optional)
    
    Returns:
        fig: matplotlib figure
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Convert to lists if they're not already
    train_loss = list(train_loss)
    
    # Plot training loss
    ax.plot(range(1, len(train_loss) + 1), train_loss, label='Training Loss')
    
    # Plot validation loss if provided
    if val_loss and len(val_loss) > 0:
        val_loss = list(val_loss)
        ax.plot(range(1, len(val_loss) + 1), val_loss, label='Validation Loss')
    
    ax.set_xlabel('Iterations')
    ax.set_ylabel('Loss')
    ax.set_title('Learning Curve')
    ax.legend()
    ax.grid(True)
    
    return fig

def plot_decision_boundary(model, df, features, target_column):
    """
    Plot a decision boundary for classification models with 2 features
    
    Args:
        model: trained classification model
        df: pandas DataFrame containing the dataset
        features: list of the two feature column names to use
        target_column: name of the target column
    
    Returns:
        fig: matplotlib figure
    """
    # Extract the two features and target
    X = df[features].values
    y = df[target_column].values
    
    # Create a mesh grid
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    x_min, x_max = X_scaled[:, 0].min() - 1, X_scaled[:, 0].max() + 1
    y_min, y_max = X_scaled[:, 1].min() - 1, X_scaled[:, 1].max() + 1
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02),
                        np.arange(y_min, y_max, 0.02))
    
    # Make predictions on the mesh grid
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    
    # Create the plot
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Plot the decision boundary
    ax.contourf(xx, yy, Z, alpha=0.4)
    
    # Plot the training points
    scatter = ax.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y, 
               edgecolor='k', alpha=0.8)
    
    # Add legend and labels
    ax.set_xlabel(features[0])
    ax.set_ylabel(features[1])
    ax.set_title('Decision Boundary')
    
    # Add a colorbar for the classes
    plt.colorbar(scatter, ax=ax)
    
    return fig

def plot_regression_line(model, df, feature, target_column):
    """
    Plot a regression line for simple regression models
    
    Args:
        model: trained regression model
        df: pandas DataFrame containing the dataset
        feature: feature column name to use for x-axis
        target_column: name of the target column
    
    Returns:
        fig: matplotlib figure
    """
    # Extract the feature and target
    X = df[feature].values.reshape(-1, 1)
    y = df[target_column].values
    
    # Create the plot
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Plot the data points
    ax.scatter(X, y, color='blue', alpha=0.5)
    
    # Sort X for the line plot
    X_sorted = np.sort(X, axis=0)
    
    # If simple linear regression, calculate the prediction line
    if hasattr(model, 'coef_') and X.shape[1] == 1:
        # For one-dimensional input
        y_pred = model.predict(X_sorted)
        ax.plot(X_sorted, y_pred, color='red', linewidth=2)
    else:
        # For more complex models, just plot data points
        pass
    
    ax.set_xlabel(feature)
    ax.set_ylabel(target_column)
    ax.set_title('Regression Line')
    ax.grid(True)
    
    return fig 