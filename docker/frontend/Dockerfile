# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set build arguments for Supabase
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG VITE_GEMINI_API_KEY

WORKDIR /app
COPY package*.json ./
# Using legacy-peer-deps to handle React 19/library conflicts
RUN npm ci --legacy-peer-deps
COPY . .

# Pass arguments to environment for the build command
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine AS runner
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
