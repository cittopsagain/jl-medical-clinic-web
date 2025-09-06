# Build stage
FROM node:22 AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with Sharp-specific flags
# RUN npm install --platform=linux --arch=x64 sharp
# RUN npm install glob@latest

# Install dependencies
# RUN npm install --ignore-scripts
RUN npm install --ignore-scripts --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Angular application with the production configuration
# RUN npm run build -- --configuration production
# RUN npm run build:test
RUN npm run build:production # or use npm run build:prod if you want the production build

# Production stage
FROM nginx:alpine

# Remove default Nginx configuration files
# RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration file
RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built Angular application from the build stage
COPY --from=build /usr/src/app/dist/Modernize/browser /usr/share/nginx/html

# Install tzdata for timezone configuration
RUN apk add --no-cache tzdata

# Set the timezone to the Philippines
ENV TZ=Asia/Manila

# For debugging purposes
RUN apk add mysql mysql-client

# Expose the port the app runs on
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

# Limit container capabilities
# Note: This is an example and may need adjustments based on your application requirements
# Uncomment the following line if you want to use Docker Compose or similar tools to set capabilities
# RUN setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx
