# nxfc_stock

[![Join the chat at https://gitter.im/newcrossfoodcoop/nxfc](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/newcrossfoodcoop/nxfc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](http://drone.newcrossfoodcoop.org.uk/api/badges/newcrossfoodcoop/nxfc_stock/status.svg)](http://drone.newcrossfoodcoop.org.uk/newcrossfoodcoop/nxfc_stock)

This repository generates a container for checkout and order services accessed
via a trusted gateway.

## Provides

* **Express** api
 * [Documentation - localhost:3040](http://localhost:3040)
 * [RAML specification - localhost:3040/api.raml](http://localhost:3040/api.raml)

This repository generates a container that **provides** checkout and order 
services intended to be accessed through a secured gateway.

## Depends

The services depend on:

* **Mongoose** to access mongodb

## Quick Start

Install docker and docker-compose, then:

```
$ docker-compose build
$ docker-compose up
```

## Tests

Install the drone CLI, then:

```
$ drone exec
```

