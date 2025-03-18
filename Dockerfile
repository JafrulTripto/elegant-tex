# Use an official OpenJDK runtime as a parent image
FROM openjdk:21-jdk-slim as build

# Set the working directory
WORKDIR /app

# Copy the Maven wrapper and pom.xml
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Grant execution permission for the Maven wrapper
RUN chmod +x mvnw

# Copy the source code
COPY src src

# Build the application
RUN ./mvnw package -DskipTests

# Use a minimal JDK runtime for the final image
FROM openjdk:21-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
