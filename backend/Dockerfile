FROM jboss/keycloak-adapter-wildfly:4.4.0.Final
ENV DEPLOYMENT_DIR /opt/jboss/wildfly/standalone/deployments/
CMD ["/opt/jboss/wildfly/bin/standalone.sh", "-b", "0.0.0.0", "--debug"]
COPY target/demo.war $DEPLOYMENT_DIR