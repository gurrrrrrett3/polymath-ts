# polymath.ts

a rewrite of [polymath](https://github.com/oraxen/polymath) in typescript because i hate python

## usage

```
npm i
npm run build
npm start
```

You will need to use a reverse proxy like nginx to proxy on both http and https, as oraxen requires https to uplaod packs, but it also replaces the https in the url with http for some reason. 
(like actually, what is [this](https://github.com/oraxen/oraxen/blob/master/core/src/main/java/io/th0rgal/oraxen/pack/upload/hosts/Polymath.java#L57))

It's recommended to use a process manager like pm2 to keep the server running.

## config

```json
{
  "server": {
    "port": 8080, // the port the server will listen on
    "url": "http://localhost:8080" // the url the server will return for pack downloads
  },
  "request": {
    "maxSize": 104857600 // the maximum size of a pack in bytes (100mb)
  },
  "cleaner": {
    "delay": 21600000, // the delay between each clean in ms (6 hours)
    "packLifespan": 604800000 // the lifespan of a pack in ms (1 week)
  }
}
```

## license

i don't care, do whatever you want with this, original polymath doesn't have a license so i'm not gonna bother
