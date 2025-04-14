#!/bin/bash

# Setup script for AI Experiments System

echo "Setting up AI Experiments System environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "Python 3 could not be found. Please install Python 3 and try again."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing required packages..."
pip install -r requirements.txt

# Create uploads directory if it doesn't exist
echo "Creating uploads directory..."
mkdir -p uploads

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    # Generate a random secret key
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
    # Update the secret key in the .env file
    sed -i "" "s/your_secret_key_here/$SECRET_KEY/" .env
fi

# Initialize the database
echo "Initializing database..."
python init_db.py

echo ""
echo "Setup complete! You can now run the application with:"
echo "source venv/bin/activate"
echo "flask run"
echo ""
echo "Default accounts:"
echo "Teacher: teacher@example.com / teacher123"
echo "Student: student@example.com / student123" 