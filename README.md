# polymath.ts

a rewrite of [polymath](https://github.com/oraxen/polymath) in typescript because i hate python

## usage

```
npm i
npm run build
npm start
```

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
