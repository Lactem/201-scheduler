FROM maven:3.6.1-jdk-8 AS build
USER root
ADD pom.xml pom.xml
ADD src src
RUN mv src/main/resources/application_docker.properties src/main/resources/application.properties
EXPOSE 8010
ENTRYPOINT ["mvn", "spring-boot:run"]