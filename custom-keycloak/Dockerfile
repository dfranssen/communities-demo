FROM jboss/keycloak:4.4.0.Final
RUN mkdir -p /opt/jboss/keycloak/providers
COPY influxdb-keycloak-event-listener-jar-with-dependencies.jar /opt/jboss/keycloak/providers/
COPY themes /opt/jboss/keycloak/themes/
