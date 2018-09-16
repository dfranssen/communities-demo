import {server} from './constants.js';

class App {
    constructor() {
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

        this.communities = document.querySelector("#communities");
        this.addCommunityListener = (e) => {
            const nameInput = document.querySelector("#nameInput");
            const name = nameInput.value;
            if (name !== undefined && name.trim().length > 0) {
                this.checkTokenBefore(this.addCommunity, { name: name});
                nameInput.value = "";
            }
        };
        document.querySelector("#addButton").addEventListener("click", this.addCommunityListener);

        this.getCommunities = this.getCommunities.bind(this);
        this.addCommunity = this.addCommunity.bind(this);
    }

    loadPage() {
        this.checkTokenBefore(this.getCommunities);
        document.querySelector("#userName").innerHTML = this.keycloak.tokenParsed.preferred_username;
        document.querySelector("#logoutUrl").setAttribute("href", this.keycloak.createLogoutUrl());
        document.querySelector("#userDetails").style.display = 'block';
        if (this.keycloak.hasRealmRole('canEdit')) {
            document.querySelector("#add").style.display = 'block';
        }
    }

    getCommunities() {
        let items = "";
        let response = fetch(`http://${server}/demo/resources/communities`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.keycloak.token
            }
        });
        response.then((r) => { return r.json() }).then((myJson) => {
            myJson.forEach((c) => {
                items += `<li>${c.name}</li>`
            });
            this.communities.innerHTML = items;
        }).catch((e) => { alert(e); });
    }

    addCommunity(params) {
        let response = fetch(`http://${server}/demo/resources/communities`, {
            method: 'post',
            body: JSON.stringify(params),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.keycloak.token
            }
        });
        response
            .then((r) => { this.checkTokenBefore(this.getCommunities); })
            .catch((e) => { alert(e); });
    }

    checkTokenBefore(f, params) {
        this.keycloak.updateToken(30).then((refreshed) => {
            f(params);
        }).catch(() => {
            alert('Failed to refresh the token, or the session has expired');
        });
    }
}

new App();