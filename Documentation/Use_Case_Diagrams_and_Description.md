# Use Case Diagrams and Descriptions

## System Overview

The AI Experiment Platform provides an educational environment for machine learning experimentation. The system allows students to upload datasets, train models, make predictions, and receive feedback from teachers.

## Actors

- **Student**: A user who uploads datasets, trains models, and makes predictions.
- **Teacher**: A user who reviews student work, provides feedback, and creates example models.
- **Administrator**: A user who manages the system and user accounts.
- **External System**: Any external system that interacts with the platform via API.

## Use Case Diagrams

### 1. User Management

```
+---------------------------------------------------------------------+
|                       AI Experiment Platform                         |
|                                                                     |
|  +---------------+      +----------------+      +----------------+   |
|  |               |      |                |      |                |   |
|  | Register      |<---- | Student        |      | Administrator  |   |
|  |               |      |                |      |                |   |
|  +---------------+      +----------------+      +----------------+   |
|         ^                      |   ^                   |             |
|         |                      |   |                   |             |
|  +---------------+             |   |                   |             |
|  |               |             |   |                   v             |
|  | Login         |<------------+   |            +----------------+   |
|  |               |<----------------+            |                |   |
|  +---------------+<-----------------------+     | Manage Users   |   |
|                                           |     |                |   |
|  +---------------+                        |     +----------------+   |
|  |               |                        |                          |
|  | Update Profile |<---------------------+                           |
|  |               |                                                   |
|  +---------------+                                                   |
|                                                                     |
+---------------------------------------------------------------------+
```

### 2. Dataset Management

```
+---------------------------------------------------------------------+
|                       AI Experiment Platform                         |
|                                                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Upload Dataset |<---- | Student        |                           |
|  |               |      |                |                           |
|  +---------------+      +----------------+                           |
|                                |                                     |
|                                v                                     |
|  +---------------+      +----------------+      +----------------+   |
|  |               |      |                |      |                |   |
|  | View Dataset  |<---- | View Statistics |<---- | Visualize Data |   |
|  | Preview       |      |                |      |                |   |
|  +---------------+      +----------------+      +----------------+   |
|                                                                     |
|  +---------------+                                                   |
|  |               |                                                   |
|  | Delete Dataset |<----------------------------------------------+  |
|  |               |                                                   |
|  +---------------+                                                   |
|                                                                     |
+---------------------------------------------------------------------+
```

### 3. Model Training

```
+---------------------------------------------------------------------+
|                       AI Experiment Platform                         |
|                                                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Select Dataset |<---- | Student        |                           |
|  |               |      |                |                           |
|  +---------------+      +----------------+                           |
|         |                                                           |
|         v                                                           |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Select Features|----->| Configure     |                           |
|  |               |      | Parameters     |                           |
|  +---------------+      +----------------+                           |
|                                |                                     |
|                                v                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Train Model   |----->| View Training  |                           |
|  |               |      | Results        |                           |
|  +---------------+      +----------------+                           |
|                                |                                     |
|                                v                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Save Model    |      | Share Model    |                           |
|  |               |      |                |                           |
|  +---------------+      +----------------+                           |
|                                                                     |
+---------------------------------------------------------------------+
```

### 4. Prediction and Analysis

```
+---------------------------------------------------------------------+
|                       AI Experiment Platform                         |
|                                                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Load Model    |<---- | Student        |                           |
|  |               |      |                |                           |
|  +---------------+      +----------------+                           |
|         |                       |                                    |
|         v                       v                                    |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Input Features |      | Upload Batch   |                           |
|  | for Prediction |      | for Prediction |                           |
|  +---------------+      +----------------+                           |
|         |                       |                                    |
|         v                       v                                    |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | View Prediction|      | View Batch     |                           |
|  | Results       |      | Results        |                           |
|  +---------------+      +----------------+                           |
|         |                                                           |
|         v                                                           |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | View Feature  |----->| Export Results |                           |
|  | Contributions |      |                |                           |
|  +---------------+      +----------------+                           |
|                                                                     |
+---------------------------------------------------------------------+
```

### 5. Teacher Features

```
+---------------------------------------------------------------------+
|                       AI Experiment Platform                         |
|                                                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | View Student  |<---- | Teacher        |                           |
|  | Models        |      |                |                           |
|  +---------------+      +----------------+                           |
|         |                       |                                    |
|         v                       v                                    |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Provide       |      | Create Example |                           |
|  | Feedback      |      | Models         |                           |
|  +---------------+      +----------------+                           |
|                                |                                     |
|                                v                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | View Student  |      | Generate       |                           |
|  | Performance   |      | Reports        |                           |
|  +---------------+      +----------------+                           |
|                                                                     |
+---------------------------------------------------------------------+
```

### 6. API Access

```
+---------------------------------------------------------------------+
|                       AI Experiment Platform                         |
|                                                                     |
|  +---------------+      +----------------+                           |
|  |               |      |                |                           |
|  | Authenticate  |<---- | External       |                           |
|  | API           |      | System         |                           |
|  +---------------+      +----------------+                           |
|         |                                                           |
|         v                                                           |
|  +---------------+      +----------------+      +----------------+   |
|  |               |      |                |      |                |   |
|  | List Available|----->| Get Model      |----->| Make Prediction|   |
|  | Models        |      | Details        |      | via API        |   |
|  +---------------+      +----------------+      +----------------+   |
|                                                                     |
+---------------------------------------------------------------------+
```

## Detailed Use Case Descriptions

### UC-01: Register New User

**Primary Actor**: Student or Teacher  
**Preconditions**: User is not registered  
**Postconditions**: User has an account in the system  

**Main Flow**:
1. User navigates to registration page
2. User enters username, email, password, and selects role (Student/Teacher)
3. System validates the input
4. System creates a new user account
5. System sends confirmation email
6. User confirms email address
7. System activates the account

**Alternative Flows**:
- 3a. Input validation fails: System shows error message
- 5a. Email fails to send: System displays alternative verification options

### UC-02: Upload Dataset

**Primary Actor**: Student  
**Preconditions**: User is logged in  
**Postconditions**: Dataset is stored in the system  

**Main Flow**:
1. User navigates to dataset upload page
2. User enters dataset name and description
3. User selects a CSV file for upload
4. System validates the file format
5. System processes and stores the dataset
6. System shows a preview of the dataset
7. System calculates and displays basic statistics

**Alternative Flows**:
- 4a. File format is invalid: System shows error message
- 5a. Dataset is too large: System notifies user of size limitations

### UC-03: Train Model

**Primary Actor**: Student  
**Preconditions**: User is logged in, has uploaded a dataset  
**Postconditions**: Trained model is stored in the system  

**Main Flow**:
1. User selects a dataset
2. User selects model type (regression or classification)
3. User selects target variable and feature variables
4. User configures training parameters
5. User initiates model training
6. System trains the model
7. System displays training results and performance metrics
8. User saves the model

**Alternative Flows**:
- 6a. Training fails: System shows error message
- 7a. Model performance is poor: System suggests improvements

### UC-04: Make Prediction

**Primary Actor**: Student  
**Preconditions**: User is logged in, has a trained model  
**Postconditions**: Prediction is made and results are displayed  

**Main Flow**:
1. User selects a trained model
2. User enters feature values for prediction
3. System validates the input
4. System makes prediction
5. System displays prediction result
6. System shows feature contribution analysis
7. User can modify input values to see updated predictions

**Alternative Flows**:
- 3a. Input validation fails: System shows error message
- 4a. Prediction fails: System shows error message

### UC-05: Provide Feedback

**Primary Actor**: Teacher  
**Preconditions**: Teacher is logged in, student has a trained model  
**Postconditions**: Feedback is stored and available to student  

**Main Flow**:
1. Teacher views list of student models
2. Teacher selects a specific model
3. Teacher examines model details and performance
4. Teacher enters feedback text
5. System stores the feedback
6. System notifies student about new feedback

**Alternative Flows**:
- 2a. No models available: System shows message

### UC-06: Access API

**Primary Actor**: External System  
**Preconditions**: System has API credentials  
**Postconditions**: API request is processed  

**Main Flow**:
1. External system authenticates with API key
2. External system requests list of available models
3. External system selects a model
4. External system sends prediction request with feature values
5. System validates the input
6. System makes prediction
7. System returns prediction result

**Alternative Flows**:
- 1a. Authentication fails: System returns error
- 5a. Input validation fails: System returns error 