Node.js API Project

Getting Started:

1. Clone the Repository:
   - `git clone https://github.com/your-username/login-api-project.git`

2. Navigate to the Project Directory.

3. Install Dependencies:
   - `npm install`

4. Configure Environment Variables:
   - Create a `.env` file in the project root.
   - Set the following variables:
     - `PORT=3000`
     - `MONGODB_URI=mongodb://localhost/login_API`
     - `SECRET_KEY=YourSecretKeyForJWT`
   - Modify the values according to your setup

5. Start the Application:
   - `npm start`

6. API Endpoint:
   - The API should now be running at http://localhost:3000.

Usage:

- Register a new user:
  - `POST /register`

- Log in and get a JWT token:
  - `POST /login`

- Get user details by email:
  - `GET /user/:email`

- Get all users:
  - `GET /users`

- Delete a user (requires authentication):
  - `DELETE /user`

- Log out (optional):
  - `POST /logout`

License:

This project is licensed under the MIT License - see the LICENSE file for details.
