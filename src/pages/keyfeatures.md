---
layout: ../layouts/BaseLayout.astro
title: Key features
---
# Key features

From the start,
our vision for Unit was
versatility,
speed,
and reliability.
Here’s how we
tackle these goals.

## Flexibility

- The
  [entire configuration](controlapi.md#configuration-api)
  is managed dynamically over HTTP
  via a friendly
  [RESTful JSON API](controlapi.md#configuration-mgmt).
- Updates to the configuration
  are performed granularly at runtime
  with zero interruption.
- Requests are
  [routed](configuration.md#configuration-routes)
  between
  [static content](configuration.md#configuration-static),
  upstream
  [servers](configuration.md#configuration-proxy),
  and local
  [apps](configuration.md#configuration-applications).
- Request filtering and dispatching uses elaborate
  [matching rules](configuration.md#configuration-routes-matching)
  that enable
  [regular expressions](configuration.md#configuration-routes-matching-patterns),
  [response header](configuration.md#configuration-response-headers) awareness,
  and
  **njs**
  [scripting](scripting.md).
- Apps in multiple languages and language versions run
  [side by side](configuration.md#configuration-applications).
- Server-side [WebAssembly](configuration.md#configuration-wasm)
  is natively supported.
- Common
  [language-specific APIs](howto/index.md#howto-frameworks)
  for all supported languages run seamlessly.
- Upstream
  [server groups](configuration.md#configuration-upstreams)
  provide dynamic load balancing
  using a weighted round-robin method.
- Originating IP identification
  [supports](configuration.md#configuration-listeners-xff)
  **X-Forwarded-For** and similar header fields.

## Performance

- Requests are asynchronously processed in threads
  with efficient event loops
  (**epoll**, **kqueue**).
- Syscalls and data copy operations
  are kept to a necessary minimum.
- 10,000 inactive HTTP keep-alive connections
  take up only a few MBs of memory.
- Router and app processes rely on low-latency IPC
  built with lock-free queues
  over shared memory.
- Built-in
  [statistics](usagestats.md#configuration-stats)
  provide insights
  into Unit’s performance.
- The number of per-app processes
  is defined statically or
  [scales](configuration.md#configuration-proc-mgmt-prcs)
  preemptively
  within given limits.
- App and instance usage statistics
  are collected and
  [exposed](usagestats.md#configuration-stats)
  via the API.
- Multithreaded request processing
  is supported for
  [Java](configuration.md#configuration-java),
  [Perl](configuration.md#configuration-perl),
  [Python](configuration.md#configuration-python),
  and
  [Ruby](configuration.md#configuration-ruby)
  apps.

## Security & robustness

- Client connections
  are handled
  by a separate non-privileged router process.
- Low-resource conditions
  (out of memory or descriptors)
  and app crashes
  are handled gracefully.
- [SSL/TLS](certificates.md#configuration-ssl)
  with
  [SNI](configuration.md#configuration-listeners-ssl),
  [session cache and tickets](configuration.md#configuration-listeners-ssl-sessions)
  is integrated
  (OpenSSL 1.0.1 and later).
- Different apps
  are isolated
  in separate processes.
- Apps can be additionally containerized
  with namespace and file system
  [isolation](configuration.md#configuration-proc-mgmt-isolation).
- Static file serving benefits from
  [chrooting](configuration.md#configuration-share-path),
  symlink and mount point
  [traversal restrictions](configuration.md#configuration-share-resolution).

## Supported app languages

Unit interoperates with:

- [Binary-compiled languages](https://www.nginx.com/blog/nginx-unit-adds-assembly-language-support/)
  in general:
  using the embedded **libunit** library.
- [Go](configuration.md#configuration-go):
  by
  [overriding](configuration.md#updating-go-apps)
  the **http** module.
- [JavaScript (Node.js)](configuration.md#configuration-nodejs):
  by automatically
  [overloading](installation.md#installation-nodejs-package)
  the **http** and **websocket** modules.
- [Java](configuration.md#configuration-java):
  by using the Servlet Specification 3.1 and WebSocket APIs.
- [Perl](configuration.md#configuration-perl):
  by using PSGI.
- [PHP](configuration.md#configuration-php):
  by using a custom SAPI module.
- [Python](configuration.md#configuration-python):
  by using WSGI or ASGI
  with WebSocket support.
- [Ruby](configuration.md#configuration-ruby):
  by using the Rack API.
- [WebAssembly](configuration.md#configuration-wasm):
  by using Wasmtime.
