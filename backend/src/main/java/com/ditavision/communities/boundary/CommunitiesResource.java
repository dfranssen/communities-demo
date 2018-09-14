package com.ditavision.communities.boundary;

import com.ditavision.communities.entity.Community;

import javax.annotation.PostConstruct;
import javax.ejb.ConcurrencyManagement;
import javax.ejb.ConcurrencyManagementType;
import javax.ejb.Singleton;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Singleton
@Path("communities")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@ConcurrencyManagement(ConcurrencyManagementType.BEAN)
public class CommunitiesResource {
    //kept in-mem in singleton just for demo purposes
    CopyOnWriteArrayList<Community> communities = new CopyOnWriteArrayList<>();

    @PostConstruct
    private void init() {
        communities.add(new Community("java"));
    }

    @GET
    public List<Community> allCommunities() {
        return communities;
    }

    @POST
    public void addCommunity(@Valid @NotNull Community community) {
        communities.add(community);
    }
}
