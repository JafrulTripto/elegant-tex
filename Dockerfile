# Use an official OpenJDK runtime as a parent image
FROM openjdk:21-jdk-slim as build

# Install Maven
RUN apt update && apt install -y maven

# Set the working directory
WORKDIR /app

# Copy the pom.xml and dependency files first (to leverage caching)
COPY pom.xml ./
RUN mvn dependency:go-offline

# Copy the source code
COPY src src

# Build the application
RUN mvn package -DskipTests

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
