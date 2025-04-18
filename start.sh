#!/bin/bash

# Start MongoDB service
echo "Starting MongoDB service..."
sudo systemctl start mongod
sleep 2
sudo systemctl status mongod

# Create data directory if it doesn't exist
mkdir -p /home/ubuntu/task_manager/data

# Initialize MongoDB with sample data if needed
echo "Checking if database needs initialization..."
if ! mongo --eval "db.getCollectionNames()" taskManager | grep -q "tasks"; then
    echo "Initializing database with sample data..."
    mongoimport --db taskManager --collection tasks --file /home/ubuntu/task_manager/interactive_app/models/sample_data/tasks.json --jsonArray
    mongoimport --db taskManager --collection books --file /home/ubuntu/task_manager/interactive_app/models/sample_data/books.json --jsonArray
    mongoimport --db taskManager --collection inventory --file /home/ubuntu/task_manager/interactive_app/models/sample_data/inventory.json --jsonArray
fi

# Start the application
echo "Starting the task management application..."
cd /home/ubuntu/task_manager/interactive_app
npm start
