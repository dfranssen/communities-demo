# Solution
## docker-compose.yml
Add the following service to the docker-compose.yml (mind the spaces according to the previous services):

```
  keycloak:
    image: jboss/keycloak:4.4.0.Final
    networks:
      communities:
        aliases:
        - keycloak
    ports:
      - "8081:8080"
    environment:
      - KEYCLOAK_USER=admin
      - KEYCLOAK_PASSWORD=password
    depends_on:
      - keycloak-db

  keycloak-db:
    image: postgres:10.5-alpine
    networks:
      communities:
        aliases:
          - postgres
    environment:
      - POSTGRES_DB=keycloak
      - POSTGRES_USER=keycloak
      - POSTGRES_PASSWORD=password
```

Execute `run.sh` again to spinup the extra containers.

## Edit hosts file
Add following to the `/etc/hosts` file:

```
127.0.0.1       keycloak
```

## Keycloak configuration
Browse to the [Administration Console ](http://keycloak:8081/auth) and login with the user `admin` and password `password`.

One could configure the realm by either importing the file `demo-realm.json` via Manage/Import or by executing following steps manually for a better comprehension:

### Add realm, roles, groups and users
1. add realm `demo`
2. create roles `canView` and `canEdit` 
3. create group `users`, with role mappings `canView` and set `users` group as default group
4. create group `admins`, with role mappings `canView` and `canEdit`
5. create a new user `user` and set `emailVerified`to true. After saving, click on the credentials tab, set a password, `temporary` to off and click on `reset password` (default users group with canRead role is applied)
6. create a new user `manager` and set `emailVerified` to true. After saving, click on the credentials tab, set a password, `temporary` to off and click on `reset password`. Add the `admins` group

### Create an API client
1. create a client with clientID `communities-api`, protocol `openid-connect`, rootUrl `http://communities-api:2018`.
2. In the next screen, add a name, make sure that `bearer-only` is selected as access type before saving.
3. On the installation tab, click `Keycloak OIDC JSON` as format and download it to the `backend/src/main/webapp/WEB-INF` folder

### Create a client for the frontend
1. create a client with clientID `communities`, protocol `openid-connect`, rootUrl `http://communities:2019`.
2. In the next screen, add a name, choose a login theme, make sure that `public` is selected as access type before saving. (also add `localhost:8080` to valid redirect url and web origins if you use the live-server)
3. On the installation tab, click `Keycloak OIDC JSON` as format and download it to the `frontend/src` folder
4. Download the `keycloak.js` from `http://keycloak:8081/auth/js/keycloak.js` and save it to the `frontend/src/js` folder

## Backend changes
WildFly with Keycloak adapter [Docker image](https://hub.docker.com/r/jboss/keycloak-adapter-wildfly/) is being used for this demo. There are many adapters, see the [Keycloak documentation](https://www.keycloak.org/docs/latest/securing_apps/index.html#openid-connect-3).

1. create `WEB-INF/web.xml` file and add:
    ```
    <login-config>
        <auth-method>KEYCLOAK</auth-method>
    </login-config>
    ```
2. `CommunitiesResource.java`
    ```
    //... class level
    @DeclareRoles({"canView", "canEdit"})
    //...
    @Inject
    Instance<Principal> principal;

    //... allCommunities method
    @RolesAllowed("canView")
    //...
    System.out.println(String.format("User %s requested all communities", principal.get().getName()));

    //... addCommunity method
    @RolesAllowed("canEdit")
    //... add argument: @Context HttpServletRequest request
    String username = ((KeycloakPrincipal) request.getUserPrincipal()).getKeycloakSecurityContext().getToken().getPreferredUsername();
    ```
3. create optionally `EJBAccessExceptionMapper.java`
    ```
    @Provider
    public class EJBAccessExceptionMapper implements ExceptionMapper<EJBAccessException> {

        @Override
        public Response toResponse(EJBAccessException exception) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
    }
    ```
4. `build.sh` and `run.sh` again to spin up a backend container with the latest changes

## Frontend changes
When developping frontend applications it is very productive to live reload the changes directly in the browser. E.g. [live-server](https://www.npmjs.com/package/live-server)

```
# only install once
sudo npm install -g live-server

cd frontend/src
live-server --browser=chrome
```

Perform following changes in the code:
1. `index.html`:
    ```
    //... add in the head section
    <script src="js/keycloak.js"></script>

    //... add as first line in the body
    <span id="userDetails" style="display: none">
        <a id="logoutUrl">Logout</a>
        <span id="userName"></span>
    </span>

    //... add style to hide
    <div id="add" style="display: none">
    ```
2. `app.js`:
    ```
    //... add in constructor
    this.keycloak = new Keycloak();
    this.keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
        if(authenticated) {
            this.loadPage();
        } else {
            alert("User could not be authenticated...");
        }
    }).catch(() => {
        alert("Authentication init failed");
    });

    //...
    this.getCommunities = this.getCommunities.bind(this);
    this.addCommunity = this.addCommunity.bind(this);
    //window.onload = this.getCommunities;

    //... add new function
    loadPage() {
        this.checkTokenBefore(this.getCommunities);
        document.querySelector("#userName").innerHTML = this.keycloak.tokenParsed.preferred_username;
        document.querySelector("#logoutUrl").setAttribute("href", this.keycloak.createLogoutUrl());
        document.querySelector("#userDetails").style.display = 'block';
        if (this.keycloak.hasRealmRole('canEdit')) {
            document.querySelector("#add").style.display = 'block';
        }
    }

    //... in both fetches, add additional header
    'Authorization': 'Bearer ' + this.keycloak.token

    //... add new funtion
    checkTokenBefore(f, params) {
        this.keycloak.updateToken(30).then((refreshed) => {
            f(params);
        }).catch(() => {
            alert('Failed to refresh the token, or the session has expired');
        });
    }

    //... change funtion call in constructor
    this.checkTokenBefore(this.addCommunity, { name: name});

    //... change funtion call in addCommunity
    .then((r) => { this.checkTokenBefore(this.getCommunities); })
    ```

## Next steps
1. customize the login screen with your own logo
2. log events to an [InfluxDB](https://www.influxdata.com/time-series-platform/) and visualize them with [Grafana](https://grafana.com). See [influxdb-keycloak-event-listener](https://github.com/dfranssen/influxdb-keycloak-event-listener) for more information.

See the `extra` branch for the result.