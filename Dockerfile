# -------- Build stage --------
FROM eclipse-temurin:21-jdk as build

RUN apt-get update && \
    apt-get install -y --no-install-recommends maven && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline

COPY src src
RUN mvn package -DskipTests


# -------- Runtime stage --------
FROM eclipse-temurin:21-jre

# Install only freetype (required for fontmanager)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libfreetype6 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
