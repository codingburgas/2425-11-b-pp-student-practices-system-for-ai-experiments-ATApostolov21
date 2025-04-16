Production Practice

Project Assignment

“System for Experiments with Artificial Intelligence”

⸻

Goal:

Create a web-based system using Flask where students and teachers can create, train, and test simple AI models while practicing database work, result visualization, and using basic algorithms (perceptron, linear and logistic regression, neural network).

⸻

1. Project Description:

Create a web application that allows users to:
	•	Access different AI models (e.g., for classification or regression).
	•	Upload a dataset to train a model (perceptron, linear regression, logistic regression, neural network).
	•	Visualize training results (accuracy, graphs, tables).
	•	Provide input to the trained system and receive predictions.
	•	Share and comment on results with other students or teachers.

⸻

2. Functional Requirements:
	•	User registration and login (students and teachers), with different access levels:
	•	Teachers can use any student’s trained models.
	•	Students can view and use only their own models.
	•	Minimum CRUD functionality (database tables):
	•	Users (with different access levels),
	•	Datasets,
	•	Trained models (weights).
	•	Model selection (perceptron, linear regression, logistic regression, etc.) and setting hyperparameters.
	•	Visualization of:
	•	Training data (scatter plot, decision boundary),
	•	Accuracy and loss graphs.

⸻

3. Technical Requirements:
	•	Flask + Flask-WTF + Flask-Bootstrap for the web interface.
	•	Flask-Login for session management.
	•	Flask-SQLAlchemy for the database.
	•	Flask Blueprints to organize the code.
	•	Use UML diagrams to describe the architecture and classes.
	•	Good MVC (Model-View-Controller) / MVT (Model-View-Template) structure.
	•	Optimized front-end with HTML/CSS/JS using Bootstrap components.
	•	Visualizations using Matplotlib or Plotly (optional).

⸻

4. Additional Requirements:
	•	Ability to upload CSV files with data.
	•	Option to download trained models.
	•	Basic API access to experiment results (optional).

⸻

5. Planning and Execution:

Create a plan with the main phases:
	•	Write all project requirements in a Word document.
	•	Use this document to create user stories.
	•	Use the gathered information to create use cases and diagrams.
	•	Design a database and create an ERD (Entity-Relationship Diagram).
	•	Create a UML class diagram to visualize how your application works.
	•	Split the project into modules (blueprints) and use Git for version control.
	•	Prepare a short presentation and demonstration of the project.