# MongoDB Atlas Setup Instructions

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
2. Create a new project
3. Build a new cluster (choose the free tier)
4. Create a database user with password
5. Set up network access to allow connections from anywhere
6. Get your connection string which will look like:
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskManager?retryWrites=true&w=majority

# Render.com Deployment Instructions

1. Create a free Render account at https://render.com/
2. Create a new Web Service
3. Connect your GitHub repository or use the manual deploy option
4. Set the following environment variables:
   - MONGODB_URI: Your MongoDB Atlas connection string
   - SESSION_SECRET: A random string for session security
   - PORT: 10000
5. Deploy your application

# Local Testing Before Deployment

1. Install MongoDB locally
2. Run the application with:
   ```
   npm install
   npm start
   ```
3. Test all features to ensure they work correctly
