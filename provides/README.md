# provides

This folder is intented for pieces functionality which represent services that
this repository provides

Examples might include:

* An express api with its RAML spec and tests
* A seneca interface
* A worker that conusumes items from a redis queue

Each folder would contain one such service.

The intention is that some of these components can be factored out into their own
**scoped** npm modules leaving a place for their assets.
