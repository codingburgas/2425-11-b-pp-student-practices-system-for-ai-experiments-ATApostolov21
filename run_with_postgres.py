#!/usr/bin/env python3
from fix_postgres import get_fixed_app

if __name__ == "__main__":
    app = get_fixed_app()
    print("Starting application with PostgreSQL...")
    print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    app.run(debug=True, port=5001) 