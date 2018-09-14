# Keycloak demo
## Intro
The idea is to start of with the `master` branch to secure with [Keycloak](https://www.keycloak.org/) from scratch both applications (HTML5/EcmaScript6 frontend and REST api Java EE7 backend).

See the `solution` branch for the result.

## Setup
Docker and docker-compose are being used and it is assumed that a Mac is being used :-)

### Edit hosts file
For demo purposes the `/etc/hosts` file have to be changed in order to use descriptive names instead of localhost:

```
127.0.0.1       communities-api
127.0.0.1       communities
```

### Build and run
1. `cd` into the project folder if this is not yet the case
2. make sure that all `sh` files have the correct permission by executing `chmod -R 744 *.sh`
3. execute `build.sh` to create the docker images
4. execute `run.sh` to run the docker containers

## Testing
Open your browser at `http://communities:2019` and `java` should be listed in the communities.

## Next steps
The frontend should be protected with a login page and the `Add community` functionality (frontend + backend) should be protected with a `canAdd` permission.

See the `solution` branch for the result.