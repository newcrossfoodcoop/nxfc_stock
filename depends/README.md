# depends

This folder is intented for pieces functionality which represent external
services that this service depends on.

Examples might include:

* A database
* Paypal
* The api for another service

Each folder would contain one such service.

The intention is that some of these components can be factored out into their own
**scoped** npm modules leaving a place for their assets.
