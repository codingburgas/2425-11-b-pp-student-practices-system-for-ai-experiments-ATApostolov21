# System for Experiments with Artificial Intelligence - Architecture

## Database Schema (Entity-Relationship Diagram)

```mermaid
erDiagram
    User ||--o{ Dataset : owns
    User ||--o{ AIModel : owns
    User ||--o{ Comment : writes
    Dataset ||--o{ AIModel : used_by
    AIModel ||--o{ Comment : has

    User {
        int id PK
        string username
        string email
        string password_hash
        string name
        string role
        datetime created_at
    }

    Dataset {
        int id PK
        string name
        text description
        string filename
        text feature_columns
        string target_column
        int row_count
        int column_count
        datetime created_at
        int user_id FK
    }
    
    AIModel {
        int id PK
        string name
        text description
        string model_type
        text hyperparameters
        blob weights
        float accuracy
        float loss
        text metrics
        datetime created_at
        float training_time
        int user_id FK
        int dataset_id FK
    }
    
    Comment {
        int id PK
        text content
        datetime created_at
        int user_id FK
        int model_id FK
    }
```

## Application Structure (Class Diagram)

```mermaid
classDiagram
    class User {
        +int id
        +string username
        +string email
        +string password_hash
        +string name
        +string role
        +datetime created_at
        +verify_password(password)
        +is_teacher()
        +is_student()
    }
    
    class Dataset {
        +int id
        +string name
        +text description
        +string filename
        +text feature_columns
        +string target_column
        +int row_count
        +int column_count
        +datetime created_at
        +int user_id
    }
    
    class AIModel {
        +int id
        +string name
        +text description
        +string model_type
        +text hyperparameters
        +blob weights
        +float accuracy
        +float loss
        +text metrics
        +datetime created_at
        +float training_time
        +int user_id
        +int dataset_id
        +get_hyperparameters()
        +set_hyperparameters(hyperparams)
        +get_metrics()
        +set_metrics(metrics_dict)
    }
    
    class Comment {
        +int id
        +text content
        +datetime created_at
        +int user_id
        +int model_id
    }
    
    User "1" -- "*" Dataset : owns
    User "1" -- "*" AIModel : owns
    User "1" -- "*" Comment : writes
    Dataset "1" -- "*" AIModel : used_by
    AIModel "1" -- "*" Comment : has
```

## Application Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant Routes
    participant Models
    participant Database
    
    User->>UI: Login/Register
    UI->>Routes: Submit credentials
    Routes->>Models: Validate user
    Models->>Database: Query user data
    Database-->>Models: Return user data
    Models-->>Routes: Authentication result
    Routes-->>UI: Login response
    UI-->>User: Dashboard access
    
    User->>UI: Upload dataset
    UI->>Routes: Submit dataset form
    Routes->>Models: Process dataset
    Models->>Database: Store dataset info
    Database-->>Models: Return dataset ID
    Models-->>Routes: Dataset upload result
    Routes-->>UI: Dataset view
    UI-->>User: Dataset details
    
    User->>UI: Train model
    UI->>Routes: Submit model form
    Routes->>Models: Train AI model
    Models->>Database: Store model & metrics
    Database-->>Models: Return model ID
    Models-->>Routes: Training result
    Routes-->>UI: Model view
    UI-->>User: Model details & visualizations
```

## Component Diagram

```mermaid
graph TD
    A[Client Browser] -->|HTTP Requests| B[Flask Application]
    B --> C[Routes Module]
    C -->|Authentication| D[Auth Routes]
    C -->|Dataset Management| E[Dataset Routes]
    C -->|Model Training| F[Model Routes]
    C -->|Visualizations| G[Visualization Routes]
    D & E & F & G -->|Database Operations| H[SQLAlchemy ORM]
    H -->|CRUD Operations| I[Database]
    F -->|AI Training| J[Model Trainer Utils]
    G -->|Generate Charts| K[Visualization Utils]
    J & K -->|Data Processing| L[NumPy/Pandas]
    J -->|ML Algorithms| M[Scikit-learn]
```

This architecture follows the Model-View-Controller (MVC) pattern:
- **Models**: Database models (User, Dataset, AIModel, Comment)
- **Views**: HTML templates with Bootstrap
- **Controllers**: Route handlers in different blueprints 