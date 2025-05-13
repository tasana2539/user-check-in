# user-check-in

url page : 
- /admin.html
- /index.html or /
after install use :
email : admin@example.com
password : admin123

for create seat and data befor use

Example user check-in system.

> **System Requirements**
>
> - **Node.js:** v18.x or higher  
> - **npm:** v9.x or higher  
> - **MongoDB:** v5.x or higher (local or Docker)
>
> Make sure you have Node.js and npm installed.  
> [Download Node.js](https://nodejs.org/)  
> [Download MongoDB](https://www.mongodb.com/try/download/community)

## Installation & Usage

1. **Install dependencies**  
   Open a terminal in the project directory and run:
   ```powershell
   npm install

   ***use this : Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   if found the error : PowerShell is blocking the execution of scripts ***
   ```

2. **Set up MongoDB**  
   The system requires a running MongoDB server. You can use a local MongoDB instance, or run MongoDB with Docker:

   **Option 1: Local MongoDB**
   - Make sure MongoDB is installed and running on your machine (default port: 27017).
   - [Download MongoDB](https://www.mongodb.com/try/download/community) if you don't have it.
   - Start MongoDB with:
     ```powershell
     mongod --port 27017
     ```

   **Option 2: Docker**
   - If you have Docker installed, you can run MongoDB with:
     ```powershell
     docker run -d -p 27017:27017 --name mongo-checkin mongo:latest
     ```

   > **Note:** If you want to use a different port, update the MongoDB connection string in your project accordingly.

3. **Start the server**  
   After installation and MongoDB setup, start the backend server with:
   ```powershell
   npm start
   ```

4. **Access the application**  
   Open your web browser and go to:
   ```
   http://localhost:3000
   ```

The system will now be ready for use.

## Viewing MongoDB Data

You can view and manage your MongoDB database in several ways:

**1. MongoDB Shell (mongosh)**

- Open a terminal and run:
  ```powershell
  mongosh
  ```
- Then, switch to the project database:
  ```javascript
  use user-check-in
  db.users.find()
  ```

**2. MongoDB Compass (GUI)**

- Download and install [MongoDB Compass](https://www.mongodb.com/products/compass).
- Open Compass and connect to:
  ```
  mongodb://localhost:27017
  ```
- Select the `user-check-in` database to view and manage collections and documents.

**3. Docker exec (if using Docker)**

- To open a shell inside your MongoDB Docker container:
  ```powershell
  docker exec -it mongo-checkin mongosh
  ```

**How to view your data inside the Docker container:**

1. Open a shell inside your MongoDB Docker container:
   ```powershell
   docker exec -it mongo-checkin mongosh
   ```
   This will give you a MongoDB shell prompt inside the running container.

2. Once inside the shell, switch to your project database:
   ```javascript
   use user-check-in
   ```

3. View your data (for example, all users):
   ```javascript
   db.users.find()
   ```

You can now inspect, query, and manage your data as needed using the same commands as with a local MongoDB shell.

**Example: Show only _id and name fields for all users**

In the MongoDB shell, run:
```javascript
db.users.find({}, { _id: 1, name: 1 })
```
This will display only the `_id` and `name` fields for each user document.

---
by tasana dev
