Pinny - Image Saving/Sharing Application

Student Name: Ashley Tran
Vanderbilt Email: ashleytran@vanderbilt.edu

HOW TO DOWNLOAD AND RUN THE PROGRAM

This application consists of a React (TypeScript) frontend and a Node.js/Express backend.

Prerequisites:
- Node.js installed on your system
- A MongoDB database connection (local or cloud, e.g. MongoDB Atlas)
- A Pixabay API key (free at https://pixabay.com/api/docs/)

Setup Instructions:
1. Clone the repository to your local machine
2. Navigate to the backend folder and run:
   npm install
   npm run dev
3. Open a new terminal, navigate to the frontend folder and run:
   npm install
   npm run dev
4. The frontend will run on http://localhost:5173 and the backend on http://localhost:3000
5. Make sure your environment variables are set up in both the frontend and backend folders (see below)

Environment Variables:
- Frontend: Create a .env file in the frontend folder with:
  VITE_API_ENDPOINT=http://localhost:3000
  VITE_PIXABAY_API_KEY=your_pixabay_api_key

- Backend: Create a .env file in the backend folder with:
  MONGO_URL=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret

Note: For security, actual credential values are not included in this submission.
Please use your own MongoDB connection string, JWT secret, and Pixabay API key.

CHALLENGE REFLECTION

Setting up the backend taught me that schemas are essential for enforcing specific
requirements on data before it's saved, and that controllers are needed to handle
the actual logic behind each request. I also learned that a JWT secret is necessary
for securely encrypting login sessions. My biggest challenges were repeated import
errors across files and getting login/authentication to work reliably, especially
making sure a user's session persisted correctly after registering or logging in.

FEEDBACK

This challenge was a great way to get real, hands-on experience with full-stack
development, especially debugging authentication and permissions across the frontend
and backend at the same time. More guidance early on around common Express/React
Router pitfalls (like route ordering) could help first-time full-stack developers
move faster.

Completion form:
https://docs.google.com/forms/d/e/1FAIpQLSdixxDT8hkTZpgV9NAAPKnKjgRy7G7xSGOQWSrj-glOtT-XRQ/viewform
