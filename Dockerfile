##
## use Dockerfile for creating a dev-container, only if need custom image
## but custom image is NOT recommended for development-only purpose,
## because would be redundant big image size and lack of command-line tools

## otherwise just use a pre-built image template for dev-container and dev-only purpose


# this is for production, lack basic tools, not suitable for development-only purpose
# FROM node:24.13-alpine  
FROM mcr.microsoft.com/devcontainers/javascript-node:24  # pre-built image for dev-only purpose


# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json  ./

# Install dependencies
RUN npm install

# USER node

# Copy the rest of your application code
# COPY . .

# fyi only, vite use 5173
EXPOSE 5173

# CMD ["npm", "run", "test"]
# CMD ["sh"]

# CMD ["sleep", "infinity"]
# ENTRYPOINT [ "sh" ] # "ENTRYPOINT" is not compatible with vscode devcontainer
