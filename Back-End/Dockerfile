FROM openjdk:21-jdk-slim

WORKDIR /app

EXPOSE 8080

COPY target/StudIA-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
