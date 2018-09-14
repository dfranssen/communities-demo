import {server} from './constants.js';

class App {
    constructor() {
        this.communities = document.querySelector("#communities");
        this.addCommunityListener = (e) => {
            const nameInput = document.querySelector("#nameInput");
            const name = nameInput.value;
            if (name !== undefined && name.trim().length > 0) {
                this.addCommunity({ name: name});
                nameInput.value = "";
            }
        };
        document.querySelector("#addButton").addEventListener("click", this.addCommunityListener);
        window.onload = this.getCommunities;
    }

    getCommunities() {
        let items = "";
        let response = fetch(`http://${server}/demo/resources/communities`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
            }
        });
        response
            .then((r) => { this.getCommunities(); })
            .catch((e) => { alert(e); });
    }
}

new App();