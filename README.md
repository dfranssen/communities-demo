# Extra solution

This solution is built on top of [https://github.com/dfranssen/communities-demo/tree/solution](https://github.com/dfranssen/communities-demo/tree/solution)

## Save Keycloak events to InfluxDB

### influxdb-keycloak-event-listener
- See https://github.com/dfranssen/influxdb-keycloak-event-listener

    Note the defaults in the Configuration section as those are being set in the `influx` service, see `add extra services to docker-compose` below

- Compile the jar and copy it to this project in a new folder named `custom-keycloak`.

### Extend the Keycloak Docker image
- Create the file `custom-keycloak/Dockerfile` with the contents:
    ```
    FROM jboss/keycloak:4.4.0.Final
    RUN mkdir -p /opt/jboss/keycloak/providers
    COPY influxdb-keycloak-event-listener-jar-with-dependencies.jar /opt/jboss/keycloak/providers/
    ```

- in the `custom-keycloak` folder create and execute `build.sh` in order to build the image:
    ```
    docker build -t demo/keycloak:4.4.0.Final .
    ```

### Add extra services to docker-compose
- add stock `influx` and `grafana` services:
    ```
    influx:
      image: influxdb:1.6.2-alpine
      ports:
        - "8086:8086"
      networks:
        communities:
        aliases:
            - influxdb
      environment:
        - INFLUXDB_DB=keycloak
        - INFLUXDB_USER=root
        - INFLUXDB_USER_PASSWORD=root

    grafana:
      image: grafana/grafana:5.2.4
      networks:
        communities:
        aliases:
            - grafana
      ports:
        - "3000:3000"
      environment:
        - GF_SECURITY_ADMIN_PASSWORD=password
      depends_on:
        - influx
    ```
- change the keycloak image from `jboss/keycloak:4.4.0.Final` to the custom built `demo/keycloak:4.4.0.Final`
- add an extra depends_on for keycloak: `influx`
- execute `run.sh` again to spinup the extra containers.

### Keycloak event configuration
- Browse to the [Administration Console](http://keycloak:8081/auth) and login with the user `admin` and password `password`.

- One could configure the realm by either importing the file `demo-realm.json` via Manage/Import (Note: users are not included) or by executing following steps manually for a better comprehension:

    1. open the realm `demo`
    2. in the left menu click on `Manage/Events` and go the `Config` tab
    3. click in the `Event Listeners` input box and select `influxDB`
    4. click on `Save`

### Configure Grafana
- Browse to [http://localhost:3000](http://localhost:3000) and login with the user `admin` and password `password`.
- click on `Add data source`
- fill out following settings:
    ```
    Name: influx
    Type: InfluxDB
    
    HTTP
    URL: http://influxdb:8086

    InfluxDB Details
    Database: keycloak
    User: root
    Password: root
    ```
- click on `Save & Test`
- in the left menu, click on the `+` icon, and on `import`
- copy the `raw` dashboard content from [https://raw.githubusercontent.com/dfranssen/influxdb-keycloak-event-listener/master/grafana-dashboards/keycloak-logins.json](https://raw.githubusercontent.com/dfranssen/influxdb-keycloak-event-listener/master/grafana-dashboards/keycloak-logins.json) and paste it into the `Or paste JSON` textbox
- click on `Load` and next on `Import`
- login on [http://communities:2019](http://communities:2019/) and see the live events in the Grafana dashboard

## Custom login theme
### file structure
- create following file structure in the `custom-keycloak` folder:
    ```
    themes
    |- communities
       |- login
          |- resources
             |- css
                |- communities.css
             |- img
                |- logo.png
          |- theme.properties
    ```
- `communities.css`:
    ```
    #kc-header-wrapper {
    font-size: 0px;
    background: url(../img/logo.png);
    background-repeat: no-repeat;
    background-position: center;
    height: 82px;
    padding-top: 20px;
    }

    .login-pf body {
        background-image: unset;
    }

    .card-pf {
        background: #ddd;
        margin: 0 auto;
        margin-top: 5px;
        padding: 0 20px;
        max-width: 500px;
        border-top: 0;
        box-shadow: 0 0 0;
    }

    @media only screen and (max-width: 767px) {
        #kc-header-wrapper {
        }

        .login-pf-page .card-pf {
            max-width: none;
            margin-left: 0;
            margin-right: 0;
            padding-top: 0;
            background-color: #fff;
        }
    }

    @media only screen and (min-width: 767px) {
        .login-pf-page .card-pf {
            padding: 20px 40px 30px 40px;
        }
    }
    ```
- as logo.png download [http://ditavision.com/images/logo.png](http://ditavision.com/images/logo.png) or your own

- `theme.properties`:
    ```
    parent=keycloak
    import=common/keycloak
    
    styles=lib/patternfly/css/patternfly.css lib/zocial/zocial.css css/login.css css/communities.css
    ```

### Extend the Keycloak Docker image
- Add following line to the end of the file `custom-keycloak/Dockerfile`:
    ```
    COPY themes /opt/jboss/keycloak/themes/
    ```

- in the `custom-keycloak` folder execute `build.sh` again in order to build the image
- execute `run.sh` again to spin up the newly built custom Keycloak

### Keycloak theme configuration
- Browse to the [Administration Console](http://keycloak:8081/auth) and login with the user `admin` and password `password`.

- One could configure the realm by either importing the file `demo-realm.json` via Manage/Import (Note: users are not included) or by executing following steps manually for a better comprehension:

    1. open the realm `demo`
    2. in the left menu click on `Configure/Realm Settings` and go the `Themes` tab
    3. select `communities` as Login Theme
    4. click on `Save`
    5. in the left menu click on `Configure/Clients` and select `communites`
    6. in the default tab `Settings` select `communities` as Login Theme
    7. click on `Save`

- Go to [http://communities:2019](http://communities:2019/) and see the customized login screen (CTRL+F5 might be needed if the styles are cached)