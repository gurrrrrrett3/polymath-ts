# polymath.ts

a rewrite of [polymath](https://github.com/oraxen/polymath) in typescript because i hate python

## usage

```
npm i
npm run build
npm start
```

~~You will need to use a reverse proxy like nginx to proxy on both http and https, as oraxen requires https to upload packs, but it also replaces the https in the url with http for some reason.~~

You no longer REQUIRE a reverse proxy for this!
[commit](https://github.com/oraxen/oraxen/commit/74b6fc6b30d562f0f3f299e076e7129ac5b06108#diff-67189ce4c452fc6da450a2d2005823059d152e9e832557f7535e88f7a750d6bcL57)

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
