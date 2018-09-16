package com.ditavision.communities.boundary;

import com.ditavision.communities.entity.Community;
import org.keycloak.KeycloakPrincipal;

import javax.annotation.PostConstruct;
import javax.annotation.security.DeclareRoles;
import javax.annotation.security.RolesAllowed;
import javax.ejb.ConcurrencyManagement;
import javax.ejb.ConcurrencyManagementType;
import javax.ejb.Singleton;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.security.Principal;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Singleton
@Path("communities")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@ConcurrencyManagement(ConcurrencyManagementType.BEAN)
@DeclareRoles({"canView", "canEdit"})
public class CommunitiesResource {
    //kept in-mem in singleton just for demo purposes
    CopyOnWriteArrayList<Community> communities = new CopyOnWriteArrayList<>();

    @Inject
    Instance<Principal> principal;

    @PostConstruct
    private void init() {
        communities.add(new Community("java"));
    }

    @GET
    @RolesAllowed("canView")
    public List<Community> allCommunities() {
        System.out.println(String.format("User %s requested all communities", principal.get().getName()));
        return communities;
    }

    @POST
    @RolesAllowed("canEdit")
    public void addCommunity(@Valid @NotNull Community community, @Context HttpServletRequest request) {
        String username = ((KeycloakPrincipal) request.getUserPrincipal()).getKeycloakSecurityContext().getToken().getPreferredUsername();
        System.out.println(String.format("User %s (%s) added a new community with name '%s'", principal.get().getName(), username, community.getName()));
        communities.add(community);
    }
}
