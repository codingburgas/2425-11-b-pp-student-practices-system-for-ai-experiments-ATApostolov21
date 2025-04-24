import psycopg2
import sys

# Connection parameters
params = {
    'dbname': 'ai_experiment_platform',
    'user': 'apostolov31',
    'host': 'localhost',
}

try:
    # Connect to the database
    print("Connecting to PostgreSQL database...")
    conn = psycopg2.connect(**params)
    
    # Create a cursor
    cur = conn.cursor()
    
    # Execute a test query
    print("Executing test query...")
    cur.execute("SELECT * FROM users LIMIT 5;")
    
    # Fetch the results
    rows = cur.fetchall()
    print(f"Query results: {len(rows)} rows returned")
    for row in rows:
        print(row)
    
    # Close cursor and connection
    cur.close()
    conn.close()
    print("Connection closed successfully")
    
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)

print("Test completed successfully")
sys.exit(0) 