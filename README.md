# nxfc_base

This is the base container for the nxfc project using alpine-node 
(mhart/alpine-node).

The intention is to also provide a cloneable base application to be able to 
quickly build new services that conform to our configuration approach.

From a versioning point of view, the major and minor versions come from 
alpine-node and the patch version will come from here.

## Micro-Service Base

The idea is to provide a structure where it is easy to create multiple services
(provides) that share data sources and are versioned together.

It should be easy to look at the structure of the code base and understand what
this services this cluster of services depend on and what are provided to the 
outside world.

```
nxfc_base
 |
 +- config
 |   |
 |   +- default.js
 |   +- development.js
 |   +- test.js
 |   +- production.js
 |
 + depends
 |   |
 |   +- mongoose
 |       |
 |       +- models
 |
 + provides
     |
     +- express
         |
         +- routes
         +- controllers
         +- raml
```

To use this base for a new app, simply clone, build out and push to your new
repository.

## Docker Base

This repository also provides base images for development, testing and 
production deployment.

### Development

This image will contain the basics to support development build, operation, 
testing and debugging, by definition it's a fatter image.

This is the file that will be used by default by *docker-compose* and 
*docker build .*.

`Dockerfile`

### Drone CI

This image is intended to be used to run drone build and test steps.

`Dockerfile.drone`

### Production

The expectation here is that drone will publish new images to a repo having 
built the assets, this image will be minimal and contain no build infrastructure.

It relies on the build steps having already been run.

`Dockerfile.prod`

