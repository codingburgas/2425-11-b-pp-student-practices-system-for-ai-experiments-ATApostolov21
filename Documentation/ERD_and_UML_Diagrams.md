# ERD and UML Diagrams

## Entity Relationship Diagram (ERD)

The following Entity Relationship Diagram represents the database structure of the AI Experiment Platform.

```
+-------------+       +-------------+       +-------------+
|    User     |       |   Dataset   |       |    Model    |
+-------------+       +-------------+       +-------------+
| id (PK)     |<----->| id (PK)     |<----->| id (PK)     |
| username    |       | name        |       | name        |
| email       |       | description |       | description |
| password    |       | file_path   |       | model_type  |
| role        |       | columns     |       | model_path  |
| created_at  |       | created_at  |       | target_col  |
| updated_at  |       | user_id (FK)|       | feature_cols|
+------+------+       +-------------+       | metrics     |
       ^                                    | dataset_id  |
       |                                    | user_id (FK)|
       |                                    +------+------+
       |                                           ^
       |                                           |
+------+------+                            +------+------+
|  Feedback   |                            | Prediction  |
+-------------+                            +-------------+
| id (PK)     |                            | id (PK)     |
| content     |                            | input_data  |
| created_at  |                            | output_data |
| user_id (FK)|                            | created_at  |
| model_id (FK)|                           | model_id (FK)|
+-------------+                            +-------------+
```

## Entity Descriptions

### User
- Represents a user of the system (student, teacher, or administrator)
- Primary key: id
- Relationships:
  - One-to-many with Dataset
  - One-to-many with Model
  - One-to-many with Feedback

### Dataset
- Represents a dataset uploaded by a user
- Primary key: id
- Foreign keys:
  - user_id (references User)
- Relationships:
  - Many-to-one with User
  - One-to-many with Model

### Model
- Represents a machine learning model trained by a user
- Primary key: id
- Foreign keys:
  - user_id (references User)
  - dataset_id (references Dataset)
- Relationships:
  - Many-to-one with User
  - Many-to-one with Dataset
  - One-to-many with Prediction
  - One-to-many with Feedback

### Prediction
- Represents a prediction made using a model
- Primary key: id
- Foreign keys:
  - model_id (references Model)
- Relationships:
  - Many-to-one with Model

### Feedback
- Represents feedback provided by a teacher on a student's model
- Primary key: id
- Foreign keys:
  - user_id (references User) - the teacher providing feedback
  - model_id (references Model) - the model receiving feedback
- Relationships:
  - Many-to-one with User
  - Many-to-one with Model

## UML Class Diagrams

### Domain Model

```
+------------------+          +------------------+         +------------------+
|       User       |          |     Dataset      |         |      Model       |
+------------------+          +------------------+         +------------------+
| -id: int         |          | -id: int         |         | -id: int         |
| -username: str   |          | -name: str       |         | -name: str       |
| -email: str      |          | -description: str|         | -description: str|
| -password: str   |<>--------| -file_path: str  |<>-------| -model_type: str |
| -role: str       |    1   * | -columns: json   |    1  * | -model_path: str |
| -created_at: date|          | -created_at: date|         | -target_col: str |
| -updated_at: date|          | -user: User      |         | -feature_cols: [] |
+------------------+          +------------------+         | -metrics: json   |
| +get_models()    |                                       | -dataset: Dataset|
| +is_teacher()    |                                       | -user: User      |
| +is_student()    |                                       +------------------+
+------------------+                                       | +predict()       |
       ^                                                   | +get_performance()|
       |                                                   | +get_equation()  |
       |                                                   +--------^---------+
       |                                                            |
+------+-------+                                          +---------+---------+
|   Teacher    |                                          |     Prediction    |
+--------------+                                          +-------------------+
| -students: [] |                                          | -id: int          |
+--------------+                                          | -input_data: json |
| +give_feedback()|                                        | -output_data: json|
| +view_students()|                                        | -created_at: date |
+--------------+                                          | -model: Model     |
                                                         +-------------------+
```

### Component Diagram

```
+---------------------------------------------------------------------+
|                      AI Experiment Platform                          |
+---------------------------------------------------------------------+
|                                                                     |
|  +---------------+      +----------------+      +----------------+   |
|  |               |      |                |      |                |   |
|  | Auth Module   |<---->| Dataset Module |<---->| Model Module   |   |
|  |               |      |                |      |                |   |
|  +------+--------+      +----------------+      +--------+-------+   |
|         ^                                                ^           |
|         |                                                |           |
|         v                                                v           |
|  +---------------+                               +----------------+   |
|  |               |                               |                |   |
|  | User Module   |                               | API Module     |   |
|  |               |                               |                |   |
|  +---------------+                               +----------------+   |
|                                                                     |
+---------------------------------------------------------------------+
```

### Sequence Diagram: Model Training Process

```
+---------+            +----------+          +-----------+         +----------+
| Student |            | System   |          | Dataset   |         | Model    |
+---------+            +----------+          +-----------+         +----------+
     |                      |                     |                     |
     | Select Dataset       |                     |                     |
     |--------------------->|                     |                     |
     |                      | Load Dataset        |                     |
     |                      |-------------------->|                     |
     |                      |                     |                     |
     |                      | Return Data         |                     |
     |                      |<--------------------|                     |
     |                      |                     |                     |
     | Select Features      |                     |                     |
     | & Target             |                     |                     |
     |--------------------->|                     |                     |
     |                      |                     |                     |
     | Configure Parameters |                     |                     |
     |--------------------->|                     |                     |
     |                      |                     |                     |
     | Train Model          |                     |                     |
     |--------------------->|                     |                     |
     |                      | Create Model        |                     |
     |                      |-------------------------------------->|  |
     |                      |                     |                     |
     |                      | Train Model         |                     |
     |                      |-------------------------------------->|  |
     |                      |                     |                     |
     |                      |                     |                     |
     |                      | Return Results      |                     |
     |                      |<--------------------------------------|  |
     |                      |                     |                     |
     | Display Results      |                     |                     |
     |<---------------------|                     |                     |
     |                      |                     |                     |
     | Save Model           |                     |                     |
     |--------------------->|                     |                     |
     |                      | Store Model         |                     |
     |                      |-------------------------------------->|  |
     |                      |                     |                     |
     | Confirmation         |                     |                     |
     |<---------------------|                     |                     |
     |                      |                     |                     |
```

### Sequence Diagram: Feature Contribution Analysis

```
+---------+            +----------+          +----------+
| Student |            | System   |          | Model    |
+---------+            +----------+          +----------+
     |                      |                     |
     | Select Model         |                     |
     |--------------------->|                     |
     |                      | Load Model          |
     |                      |-------------------->|
     |                      |                     |
     |                      | Return Model        |
     |                      |<--------------------|
     |                      |                     |
     | Enter Feature Values |                     |
     |--------------------->|                     |
     |                      | Make Prediction     |
     |                      |-------------------->|
     |                      |                     |
     |                      | Return Prediction   |
     |                      |<--------------------|
     |                      |                     |
     |                      | Calculate Feature   |
     |                      | Contributions       |
     |                      |-------------------->|
     |                      |                     |
     |                      | Return Contributions|
     |                      |<--------------------|
     |                      |                     |
     | Display Prediction & |                     |
     | Feature Contributions|                     |
     |<---------------------|                     |
     |                      |                     |
     | Update Input Values  |                     |
     |--------------------->|                     |
     |                      | Recalculate         |
     |                      | (Client-side JS)    |
     |                      |-------------------->|
     |                      |                     |
     | Updated Display      |                     |
     |<---------------------|                     |
     |                      |                     |
```

## Database Schema

### User Table

| Column     | Type         | Constraints       |
|------------|--------------|-------------------|
| id         | Integer      | Primary Key       |
| username   | String(100)  | Not Null, Unique  |
| email      | String(100)  | Not Null, Unique  |
| password   | String(255)  | Not Null          |
| role       | String(20)   | Not Null          |
| created_at | DateTime     | Not Null          |
| updated_at | DateTime     | Not Null          |

### Dataset Table

| Column      | Type         | Constraints                 |
|-------------|--------------|----------------------------|
| id          | Integer      | Primary Key                |
| name        | String(100)  | Not Null                   |
| description | Text         | Nullable                   |
| file_path   | String(255)  | Not Null                   |
| columns     | Text (JSON)  | Not Null                   |
| created_at  | DateTime     | Not Null                   |
| user_id     | Integer      | Foreign Key (users.id)     |

### Model Table

| Column         | Type         | Constraints                 |
|----------------|--------------|----------------------------|
| id             | Integer      | Primary Key                |
| name           | String(100)  | Not Null                   |
| description    | Text         | Nullable                   |
| model_type     | String(50)   | Not Null                   |
| model_path     | String(255)  | Not Null                   |
| target_column  | String(100)  | Not Null                   |
| feature_columns| Text (JSON)  | Not Null                   |
| metrics        | Text (JSON)  | Nullable                   |
| feature_importance | Text (JSON) | Nullable                |
| created_at     | DateTime     | Not Null                   |
| updated_at     | DateTime     | Not Null                   |
| dataset_id     | Integer      | Foreign Key (datasets.id)  |
| user_id        | Integer      | Foreign Key (users.id)     |

### Prediction Table

| Column     | Type         | Constraints                 |
|------------|--------------|----------------------------|
| id         | Integer      | Primary Key                |
| input_data | Text (JSON)  | Not Null                   |
| output_data| Text (JSON)  | Not Null                   |
| created_at | DateTime     | Not Null                   |
| model_id   | Integer      | Foreign Key (models.id)    |

### Feedback Table

| Column     | Type         | Constraints                 |
|------------|--------------|----------------------------|
| id         | Integer      | Primary Key                |
| content    | Text         | Not Null                   |
| created_at | DateTime     | Not Null                   |
| user_id    | Integer      | Foreign Key (users.id)     |
| model_id   | Integer      | Foreign Key (models.id)    | 