# Agnostic Proximity

Voice chat built to hook into any game

## Setup

1. Set up `.env`

```env
AUTH_TOKEN=password # Static authentication token used by users to connect
HOST=proximity.example.com # Where your backend is hosted - i.e. proximity.example.com
```

2. Set up a VPS

- Install docker and docker-compose
- Clone this repo
- Run `docker-compose build` and `docker-compose up`

3. Set up DNS records

Use Cloudflare for automatic SSL. Set SSL mode to Flexible.

If your `HOST` is set to `proximity.example.com`: 

1. An `A` record on `backend-proximity.example.com` pointing to your server's IP
2. An `A` record on `proximity.example.com` pointing to your server's IP
3. An `A` record on `turn-proximity.example.com` pointing to your server's IP **NOT PROXIED THROUGH CLOUDFLARE**
4. An `AAAA` record on `turn-proximity.example.com` pointing to your server's IPv6 **NOT PROXIED THROUGH CLOUDFLARE**
