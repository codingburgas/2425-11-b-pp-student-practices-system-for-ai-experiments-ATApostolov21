import os
from app import create_app

# Create the application instance
app = create_app(os.getenv('FLASK_ENV') or 'default')

# Run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 