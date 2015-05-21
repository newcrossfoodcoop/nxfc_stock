# nxfc_base

This is the base container for the nxfc project.

The Dockerfile grabs the ```package.json``` and ```bower.json``` from the main project using ```wget``` against a tag (usually ```nxfc_base_vN```).

This repository needs to also be tagged in the format ```vN``` and a corresponding tag setup in docker.hub for automated building.

The ```latest``` docker.hub tag follows ```master```.


