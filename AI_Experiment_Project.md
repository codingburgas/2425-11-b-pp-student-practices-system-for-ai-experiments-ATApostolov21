
# 🧠 AI Experiment Web Application (Student & Teacher Platform)

This is a web application for running machine learning experiments in a simple and educational environment. The project allows **students** to upload datasets, train models, and receive **real-time predictions**. **Teachers** can view student work, give feedback, and monitor learning progress.

Built primarily for **educational purposes**, the platform focuses on **usability, interactivity, and simplicity**, avoiding backend complexity where possible.

---

## 🚀 Project Goals

- Create an interactive and understandable interface for experimenting with AI models
- Let users upload their own datasets
- Allow model training with simple algorithms like:
  - Perceptron
  - Linear Regression
  - Neural Networks (basic)
- Enable live prediction with sliders and visual feedback
- Support two roles: **students** and **teachers**
- Keep logic simple: **No database, no backend-auth**

---

## 👤 User Roles

### Student
- Registers with a username and selects their teacher
- Can:
  - Upload datasets
  - Train models
  - View and interpret predictions
  - Access their own dashboard
- Sees:
  - Home
  - Upload Dataset
  - Train Model
  - Dashboard

### Teacher
- Registers with a username only
- Can:
  - View all student models linked to them
  - Comment on model performance
  - Access home page and teacher dashboard
- Sees:
  - Home
  - Dashboard (with student models and feedback section)

---

## 🔐 Authentication Logic

> Authentication is handled entirely in the **frontend using `localStorage`**

### Registration
- `username` (text)
- `role` (dropdown: `"student"` or `"teacher"`)
- If role is `"student"`:
  - Select a teacher (from existing teachers)

### Login
- Enter username (pre-filled or typed manually)
- App verifies user from `localStorage`

### Data Structure (localStorage)
```json
users = [
  {
    "username": "student1",
    "role": "student",
    "teacher": "teacher1"
  },
  {
    "username": "teacher1",
    "role": "teacher"
  }
]

currentUser = {
  "username": "student1",
  "role": "student",
  "teacher": "teacher1"
}
```

---

## 📊 Core Features

### 🧪 Dataset Upload
- Students can upload `.csv` datasets
- Stored in memory/localStorage
- Displayed in a table for preview

### ⚙️ Model Training
- Algorithms:
  - Linear Regression
  - Perceptron
  - Simple Neural Networks (optional)
- Students select the dataset, algorithm, and features
- Output includes performance metrics (accuracy, loss, etc.)

### 🔮 Real-Time Prediction
- After training, sliders for each feature appear
- Predictions update live as sliders move
- Results are shown with:
  - Rounded integers (not floats)
  - Plain-language explanations of what the prediction means
  - Example: “The predicted house price is $245,000 based on your input.”

### 📈 Visualization
- Display:
  - Feature importance (bar chart for linear models)
  - Loss or accuracy curves if applicable
- Dashboard overview of all trained models

---

## 🧑‍🏫 Teacher Dashboard

- Lists all student models where `student.teacher == currentTeacher`
- Shows:
  - Dataset name
  - Model type
  - Performance metrics
  - Student name
  - Prediction summary
  - Comment box for feedback
- Feedback is stored in `localStorage` with the model

---

## 🧭 Navigation Logic

### Navbar
- **Student:** Home | Datasets | Models | Dashboard | Logout
- **Teacher:** Home | Dashboard | Logout

### Route Protection
- On load, check if `currentUser` exists in `localStorage`
  - If not: redirect to login
  - If yes: redirect to role-based homepage

---

## 📁 Project Structure Suggestion

```
/public
  index.html

/src
  /auth
    login.js
    register.js
  /components
    navbar.js
    homepage.js
    dashboard.js
    modelTrainer.js
    predictionUI.js
  /data
    storage.js  // handles localStorage reads/writes
  /utils
    mlUtils.js  // simple training algorithms
  app.js
```

---

## 💡 Future Improvements

- Switch to backend authentication and database (Flask or Supabase)
- Add file validation and dataset preprocessing
- Improve model visualization (charts, graphs)
- Export trained model stats
- Gamify learning (e.g. badges, points for good performance)

---

## 🧑‍💻 Built With

- HTML, CSS, JavaScript (vanilla or React)
- `localStorage` for authentication and data
- `Plotly.js` or `Chart.js` for visualization
- Simple Python (via Flask) if ML needs to run server-side (optional)
