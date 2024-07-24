# Polymath

A rewrite of [oraxen/polymath](https://github.com/oraxen/polymath) in typescript.

## How to use

### Using Pterodactyl

- Download and Install [Eggs](www.google.com) to your Pterodactyl Panel.
- Create a new server using port `8181` since 8080 used for Pterodactyl Panel.
- Setup Nginx as below:

  ```
  server {
      listen 80;
      server_name atlas.domain.com;

      location / {
          proxy_pass http://0.0.0.0:8181;
          proxy_set_header X-Real-IP $remote_addr;
          client_max_body_size 16M;
      }
  }

  server {
      listen 443 ssl;
      server_name atlas.domain.com;

      ssl_certificate /etc/letsencrypt/live/atlas.reforged.world/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/atlas.reforged.world/privkey.pem;

      location / {
          proxy_pass http://0.0.0.0:8181;
          proxy_set_header X-Real-IP $remote_addr;
          client_max_body_size 16M;
      }
  }
  ```

  Remember to [Creating SSL Certificates](https://pterodactyl.io/tutorials/creating_ssl_certificates.html)

### Using Public Atlas

Edit file `Oraxen/settings.yml`

```
Pack:
  upload:
    enabled: true
    type: polymath
    polymath:
      server: atlas.reforged.world
      secret: ChangeThisUsingYourUniqueId
```

---

Support: [Discord](https://discord.gg/mjmdE9C67a)
