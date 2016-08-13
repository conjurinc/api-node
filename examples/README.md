# Possum API Node.js examples

This directory contains Possum Node.js API examples.

# Setup

Use `docker-compose` to startup the following containers:

* `pg` backing database
* `possum` Possum server
* `example` Example data
* `client` Possum API for Node.js

When you run the startup script, these containers will start and you'll get an interactive shell in the `client` container:

```sh-session
$ ./start.sh
root@5c15c5cf16d7:/app# 
```
