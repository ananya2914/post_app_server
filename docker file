# Use an official Node.js runtime as a parent image with a specific version
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies including devDependencies
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Rebuild bcrypt to ensure it matches the container's architecture
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on (if your application uses a different port, adjust accordingly)
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
