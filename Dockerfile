# 1. Use an official Node.js image as the base
FROM node:20-alpine

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the app's code into the container
COPY . .

# 6. Build the Vite app for production
RUN npm run build

# 7. Serve the app using a static file server
RUN npm install -g serve

# 8. Expose port 5000 for the server
EXPOSE 5000

# 9. Start the server to serve the built files
CMD ["serve", "-s", "dist", "-l", "5000"]