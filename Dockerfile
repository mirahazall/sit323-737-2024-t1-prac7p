#To build the docker image use: docker build -t calculator-microservice .
#Before publishing the docker image we need to do a test run on our development computer to make sure everything is in working order. 
#Once we’ve packaged our microservice as a Docker image, we can use the docker run command to instantiate it as a container. 
#docker run -d -p 3000:3000 -e PORT=3000 calculator-microservice -> This creates a local instance of our microservice that we can then test using a web browser.

#To push a Docker image to a container registry (Docker hub in this case): 
#1. We need to use "docker login" command to login to docker
#2. We need to use "docker tag calculator-microservice mirahazall64/calculator-microservice:latest" command to tag our local Docker image to associate it with a specific repository in Docker Hub.
#3. We need to use "docker push mirahazall64/calculator-microservice:latest" to upload the tagged image to Docker Hub to make it accessible from anywhere.

FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]

