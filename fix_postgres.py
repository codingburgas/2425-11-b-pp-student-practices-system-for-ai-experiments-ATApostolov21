import os
import sys
from flask import Flask
from config import Config
import psycopg2

# Hard-code PostgreSQL connection
os.environ['DATABASE_URL'] = 'postgresql://apostolov31:@localhost/ai_experiment_platform'
os.environ['SQLALCHEMY_DATABASE_URI'] = 'postgresql://apostolov31:@localhost/ai_experiment_platform'

# Delete any SQLite files
sqlite_files = [
    'app.db',
    'instance/app.db',
    'ai_experiment_platform.db'
]

for file in sqlite_files:
    if os.path.exists(file):
        try:
            os.remove(file)
            print(f"Removed {file}")
        except:
            print(f"Failed to remove {file}")

# Verify PostgreSQL connection
try:
    conn = psycopg2.connect(
        dbname='ai_experiment_platform',
        user='apostolov31',
        host='localhost'
    )
    
    print("PostgreSQL connection successful!")
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users;")
    count = cur.fetchone()[0]
    print(f"User count: {count}")
    
    conn.close()
except Exception as e:
    print(f"Error connecting to PostgreSQL: {e}")
    sys.exit(1)

# Override Config class
class PostgresOnlyConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'postgresql://apostolov31:@localhost/ai_experiment_platform'
    TESTING = False

# Create a function to run with the fixed config
def get_fixed_app():
    from app import create_app
    app = create_app(config_class=PostgresOnlyConfig)
    return app

if __name__ == "__main__":
    print("This script prepares your application to use PostgreSQL exclusively.")
    print("Run your application using: python3 -c 'from fix_postgres import get_fixed_app; app=get_fixed_app(); app.run(debug=True)'") 