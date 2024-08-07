# Comparing texts

## Setup

```shell
docker rmi ghcr.io/mbs9/substr-analyzer:latest
docker run -e NO_CAPTCHA=1 -p 8080:8080 --rm ghcr.io/mbs9/substr-analyzer:latest
```

Then go to [this URL](https://mbs9.github.io/substr/run)and enjoy!

## Technical Setup

The `rust` directory contains the Rust extension module

The `app` directory contains the Python web app.

First, go to the `app` directory, and setup the `.env` file.

Then:

```shell
docker build -t string_compare .
docker run --rm -p 8080:8080 string_compare
```

Then go to `http://localhost:8080/`

Or from pre-built container

```shell
docker run --env-file ./app/.env -p 8080:8080 --rm ghcr.io/mbs9/substr-analyzer:latest
```

Or

```shell
docker run -e NO_CAPTCHA=1 -p 8080:8080 --rm ghcr.io/mbs9/substr-analyzer:latest
```