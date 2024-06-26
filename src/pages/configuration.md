---
layout: "@layouts/BaseLayout.astro"
title: Configuration
order: 5
---
# Configuration

The **/config** section of the
[control API](controlapi.md#configuration-api)
handles Unit’s general configuration with entities such as
[listeners](#configuration-listeners),
[routes](#configuration-routes),
[applications](#configuration-applications),
or
[upstreams](#configuration-upstreams).

<a id="configuration-listeners"></a>

## Listeners

To accept requests,
add a listener object in the **config/listeners** API section;
the object’s name can be:

- A unique IP socket:
  **127.0.0.1:80**, **[::1]:8080**
- A wildcard that matches any host IPs on the port:
  **\*:80**
- On Linux-based systems,
  : [abstract UNIX sockets](https://man7.org/linux/man-pages/man7/unix.7.html)
    can be used as well:
    **unix:@abstract_socket**.

#### NOTE
Also on Linux-based systems,
wildcard listeners can’t overlap with other listeners
on the same port
due to rules imposed by the kernel.
For example, **\*:8080** conflicts with **127.0.0.1:8080**;
in particular,
this means **\*:8080** can’t be *immediately* replaced
by **127.0.0.1:8080**
(or vice versa)
without deleting it first.

Unit dispatches the requests it receives
to destinations referenced by listeners.
You can plug several listeners into one destination
or use a single listener
and hot-swap it between multiple destinations.

Available listener options:

| Option              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **pass** (required) | Destination to which the listener passes incoming requests.<br/>Possible alternatives:<br/><br/>- [Application](#configuration-applications):<br/>  **applications/qwk2mart**<br/>- [PHP target](#configuration-php-targets)<br/>  or<br/>  [Python target](#configuration-python-targets):<br/>  **applications/myapp/section**<br/>- [Route](#configuration-routes):<br/>  **routes/route66**, **routes**<br/>- [Upstream](#configuration-upstreams):<br/>  **upstreams/rr-lb**<br/><br/>The value is<br/>[variable](#configuration-variables)<br/>-interpolated;<br/>if it matches no configuration entities after interpolation,<br/>a 404 “Not Found” response is returned. |
| **forwarded**       | Object;<br/>configures client IP address and protocol<br/>[replacement](#configuration-listeners-forwarded).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **tls**             | Object;<br/>defines SSL/TLS<br/>[settings](#configuration-listeners-ssl).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Here, a local listener accepts requests at port 8300
and passes them to the **blogs** app
[target](#configuration-php-targets)
identified by the **uri**
[variable](#configuration-variables).
The wildcard listener on port 8400
relays requests at any host IPs
to the **main**
[route](#configuration-routes):

```json
{
    "127.0.0.1:8300": {
        "pass": "applications/blogs$uri"
    },

    "*:8400": {
        "pass": "routes/main"
    }
}
```

Also, **pass** values can be
[percent encoded](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1).
For example, you can escape slashes in entity names:

```json
{
    "listeners": {
         "*:80": {
             "pass": "routes/slashes%2Fin%2Froute%2Fname"
         }
    },

    "routes": {
         "slashes/in/route/name": []
    }
}
```

<a id="configuration-listeners-ssl"></a>

### SSL/TLS configuration

The **tls** object provides the following options:

| Option                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                            |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **certificate** (required) | String or an array of strings;<br/>refers to one or more<br/>[certificate bundles](certificates.md#configuration-ssl)<br/>uploaded earlier,<br/>enabling secure communication via the listener.                                                                                                                                                                                                                                        |
| **conf_commands**          | Object;<br/>defines the OpenSSL<br/>[configuration commands](https://www.openssl.org/docs/manmaster/man3/SSL_CONF_cmd.html)<br/>to be set for the listener.<br/><br/>To have this option,<br/>Unit must be built and run with OpenSSL 1.0.2+:<br/><br/>```bash<br/>$ openssl version<br/><br/>      OpenSSL 1.1.1d  10 Sep 2019<br/>```<br/><br/>Also, make sure your OpenSSL version supports the commands<br/>set by this option. |
| **session**                | Object; configures the TLS session cache and tickets<br/>for the listener.                                                                                                                                                                                                                                                                                                                                                             |

To use a certificate bundle you
[uploaded](certificates.md#configuration-ssl)
earlier,
name it in the **certificate** option of the **tls** object:

```json
{
    "listeners": {
        "127.0.0.1:443": {
            "pass": "applications/wsgi-app",
            "tls": {
                "certificate": ":nxt_hint:`bundle <Certificate bundle name>`"
            }
        }
    }
}
```

Since version 1.23.0,
Unit supports configuring
[Server Name Indication (SNI)](https://datatracker.ietf.org/doc/html/rfc6066#section-3)
on a listener
by supplying an array of certificate bundle names
for the **certificate** option value:

```json
{
    "*:443": {
        "pass": "routes",
        "tls": {
            "certificate": [
                "bundleA",
                "bundleB",
                "bundleC"
            ]
        }
    }
}
```

- If the connecting client sends a server name,
  Unit responds with the matching certificate bundle.
- If the name matches several bundles,
  exact matches have priority over wildcards;
  if this doesn’t help, the one listed first is used.
- If there’s no match or no server name was sent, Unit uses
  the first bundle on the list.

To set custom OpenSSL
[configuration commands](https://www.openssl.org/docs/manmaster/man3/SSL_CONF_cmd.html)
for a listener,
use the **conf_commands** object in **tls**:

```json
{
    "tls": {
        "certificate": ":nxt_hint:`bundle <Certificate bundle name>`",
        "conf_commands": {
            "ciphersuites": ":nxt_hint:`TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256 <Mandatory cipher suites as per RFC8446, section 9.1>`",
            "minprotocol": "TLSv1.3"
        }
    }
}
```

<a id="configuration-listeners-ssl-sessions"></a>

The **session** object in **tls**
configures the session settings of the listener:

| Option         | Description                                                                                                                                                                                                                                                                                         |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **cache_size** | Integer;<br/>sets the number of sessions in the TLS session cache.<br/><br/>The default is **0**<br/>(caching is disabled).                                                                                                                                                                         |
| **tickets**    | Boolean, string, or an array of strings;<br/>configures TLS session tickets.<br/><br/>The default is **false**<br/>(tickets are disabled).                                                                                                                                                          |
| **timeout**    | Integer;<br/>sets the session timeout for the TLS session cache.<br/><br/>When a new session is created,<br/>its lifetime derives from current time and **timeout**.<br/>If a cached session is requested past its lifetime,<br/>it is not reused.<br/><br/>The default is **300**<br/>(5 minutes). |

Example:

```json
{
    "tls": {
        "certificate": ":nxt_hint:`bundle <Certificate bundle name>`",
        "session": {
            "cache_size": 10240,
            "timeout": 60,
            "tickets": [
                "k5qMHi7IMC7ktrPY3lZ+sL0Zm8oC0yz6re+y/zCj0H0/sGZ7yPBwGcb77i5vw6vCx8vsQDyuvmFb6PZbf03Auj/cs5IHDTYkKIcfbwz6zSU=",
                "3Cy+xMFsCjAek3TvXQNmCyfXCnFNAcAOyH5xtEaxvrvyyCS8PJnjOiq2t4Rtf/Gq",
                "8dUI0x3LRnxfN0miaYla46LFslJJiBDNdFiPJdqr37mYQVIzOWr+ROhyb1hpmg/QCM2qkIEWJfrJX3I+rwm0t0p4EGdEVOXQj7Z8vHFcbiA="
            ]
        }
    }
}
```

The **tickets** option works as follows:

- Boolean values enable or disable session tickets;
  with **true**, a random session ticket key is used:
  ```json
  {
      "session": {
          "tickets": :nxt_hint:`true <Enables session tickets>`
      }
  }
  ```
- A string enables tickets
  and explicitly sets the session ticket key:
  ```json
  {
      "session": {
          ":nxt_hint:`tickets <Enables session tickets, sets a single session ticket key>`": "IAMkP16P8OBuqsijSDGKTpmxrzfFNPP4EdRovXH2mqstXsodPC6MqIce5NlMzHLP"
      }
  }
  ```

  This enables ticket reuse in scenarios
  where the key is shared between individual servers.

  If multiple Unit instances need to recognize tickets
  issued by each other
  (for example, when running behind a load balancer),
  they should share session ticket keys.

  For example,
  consider three SSH-enabled servers named **unit\*.example.com**,
  with Unit installed and identical **\*:443** listeners configured.
  To configure a single set of three initial keys on each server:
  ```shell
  SERVERS="unit1.example.com
  unit2.example.com
  unit3.example.com"

  KEY1=$(openssl rand -base64 48)
  KEY2=$(openssl rand -base64 48)
  KEY3=$(openssl rand -base64 48)

  for SRV in $SERVERS; do
      ssh :nxt_hint:`root <Assuming Unit runs as root on each server>`@$SRV  \
          curl -X PUT -d '["$KEY1", "$KEY2", "$KEY3"]' --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to the remote control socket>`  \
              'http://localhost/config/listeners/*:443/tls/session/tickets/'
  done
  ```

  To add a new key on each server:
  ```shell
  NEWKEY=$(openssl rand -base64 48)

  for SRV in $SERVERS; do
      ssh :nxt_hint:`root <Assuming Unit runs as root on each server>`@$SRV  \
          curl -X POST -d '\"$NEWKEY\"' --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to the remote control socket>`  \
              'http://localhost/config/listeners/*:443/tls/session/tickets/'"
  done
  ```

  To delete the oldest key after adding the new one:
  ```shell
  for SRV in $SERVERS; do
      ssh :nxt_hint:`root <Assuming Unit runs as root on each server>`@$SRV  \
          curl -X DELETE --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to the remote control socket>`  \
              'http://localhost/config/listeners/*:443/tls/session/tickets/0'
  done
  ```

  This scheme enables safely sharing session ticket keys
  between individual Unit instances.

  Unit supports AES256 (80-byte keys) or AES128 (48-byte keys);
  the bytes should be encoded in Base64:
  ```bash
  $ openssl rand -base64 48

        LoYjFVxpUFFOj4TzGkr5MsSIRMjhuh8RCsVvtIJiQ12FGhn0nhvvQsEND1+OugQ7

  $ openssl rand -base64 80

        GQczhdXawyhTrWrtOXI7l3YYUY98PrFYzjGhBbiQsAWgaxm+mbkm4MmZZpDw0tkK
        YTqYWxofDtDC4VBznbBwTJTCgYkJXknJc4Gk2zqD1YA=
  ```
- An array of strings just like the one above:
  ```json
  {
      "session": {
          ":nxt_hint:`tickets <Enables session tickets, sets two session ticket keys>`": [
              "IAMkP16P8OBuqsijSDGKTpmxrzfFNPP4EdRovXH2mqstXsodPC6MqIce5NlMzHLP",
              "Ax4bv/JvMWoQG+BfH0feeM9Qb32wSaVVKOj1+1hmyU8ORMPHnf3Tio8gLkqm2ifC"
          ]
      }
  }
  ```

  Unit uses these keys to decrypt the tickets submitted by clients
  who want to recover their session state;
  the last key is always used to create new session tickets
  and update the tickets created earlier.

  #### NOTE
  An empty array effectively disables session tickets,
  same as setting **tickets** to **false**.

<a id="configuration-listeners-forwarded"></a>

### IP, protocol forwarding

Unit enables the **X-Forwarded-\*** header fields
with the **forwarded** object and its options:

| Option                | Description                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **source** (required) | String or an array of strings;<br/>defines<br/>[address-based patterns](#configuration-routes-matching-patterns)<br/>for trusted addresses.<br/>Replacement occurs only if the source IP of the request is a<br/>[match](#configuration-routes-matching-resolution).<br/><br/>A special case here is the **“unix”** string;<br/>it matches *any* UNIX domain sockets. |
| **client_ip**         | String;<br/>names the HTTP header fields to expect in the request.<br/>They should use the<br/>[X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)<br/>format where the value is a comma- or space-separated list<br/>of IPv4s or IPv6s.                                                                                     |
| **protocol**          | String;<br/>defines the relevant HTTP header field to look for in the request.<br/>Unit expects it to follow the<br/>[X-Forwarded-Proto](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto)<br/>notation,<br/>with the field value itself<br/>being **http**, **https**, or **on**.                                                         |
| **recursive**         | Boolean;<br/>controls how the **client_ip** fields are traversed.<br/><br/>The default is **false**<br/>(no recursion).                                                                                                                                                                                                                                               |

#### NOTE
Besides **source**,
the **forwarded** object must specify
**client_ip**, **protocol**, or both.

#### WARNING
Before version 1.28.0,
Unit provided the **client_ip** object
that evolved into **forwarded**:

| **client_ip** (pre-1.28.0)   | **forwarded** (post-1.28.0)   |
|------------------------------|-------------------------------|
| **header**                   | **client_ip**                 |
| **recursive**                | **recursive**                 |
| **source**                   | **source**                    |
| N/A                          | **protocol**                  |

This old syntax still works but will be eventually deprecated,
though not earlier than version 1.30.0.

When **forwarded** is set,
Unit respects the appropriate header fields
only if the immediate source IP of the request
[matches](#configuration-routes-matching-resolution)
the **source** option.
Mind that it can use not only subnets but any
[address-based patterns](#configuration-routes-matching-patterns):

```json
{
    "forwarded": {
        "client_ip": "X-Forwarded-For",
        "source": [
            ":nxt_hint:`198.51.100.1-198.51.100.254 <Ranges can be specified explicitly>`",
            ":nxt_hint:`!198.51.100.128/26 <Negation rejects any addresses originating here>`",
            ":nxt_hint:`203.0.113.195 <Individual addresses are supported as well>`"
        ]
    }
}
```

<a id="configuration-listeners-xfp"></a>

#### Overwriting protocol scheme

The **protocol** option enables overwriting
the incoming request’s protocol scheme
based on the header field it specifies.
Consider the following **forwarded** configuration:

```json
{
    "forwarded": {
        "protocol": "X-Forwarded-Proto",
        "source": [
            "192.0.2.0/24",
            "198.51.100.0/24"
        ]
    }
}
```

Suppose a request arrives with the following header field:

```none
X-Forwarded-Proto: https
```

If the source IP of the request matches **source**,
Unit handles this request as an **https** one.

<a id="configuration-listeners-xff"></a>

#### Originating IP identification

Unit also supports identifying the clients’ originating IPs
with the **client_ip** option:

```json
{
    "forwarded": {
        "client_ip": "X-Forwarded-For",
        "recursive": false,
        "source": [
            "192.0.2.0/24",
            "198.51.100.0/24"
        ]
    }
}
```

Suppose a request arrives with the following header fields:

```none
X-Forwarded-For: 192.0.2.18
X-Forwarded-For: 203.0.113.195, 198.51.100.178
```

If **recursive** is set to **false**
(default),
Unit chooses the *rightmost* address of the *last* field
named in **client_ip**
as the originating IP of the request.
In the example,
it’s set to 198.51.100.178 for requests from 192.0.2.0/24 or 198.51.100.0/24.

If **recursive** is set to **true**,
Unit inspects all **client_ip** fields in reverse order.
Each is traversed from right to left
until the first non-trusted address;
if found, it’s chosen as the originating IP.
In the previous example with **“recursive”: true**,
the client IP would be set to 203.0.113.195
because 198.51.100.178 is also trusted;
this simplifies working behind multiple reverse proxies.

<a id="configuration-routes"></a>

## Routes

The **config/routes** configuration entity
defines internal request routing.
It receives requests
from [listeners](#configuration-listeners)
and filters them through
[sets of conditions](#configuration-routes-matching)
to be processed by
[apps](#configuration-applications),
[proxied](#configuration-proxy)
to external servers or
[load-balanced](#configuration-upstreams)
between them,
served with
[static content](#configuration-static),
[answered](#configuration-return)
with arbitrary status codes, or
[redirected](#configuration-return).

In its simplest form,
**routes** is an array
that defines a single route:

```json
{
     "listeners": {
         "*:8300": {
             "pass": "routes"
         }
     },

     ":nxt_hint:`routes <Array-mode routes, simply referred to as 'routes'>`": [
         ":nxt_ph:`... <Any acceptable route array may go here; see the 'Route Steps' section for details>`"
     ]
}
```

Another form is an object
with one or more named route arrays as members:

```json
{
     "listeners": {
         "*:8300": {
             "pass": "routes/main"
         }
     },

     "routes": {
         ":nxt_hint:`main <Named route, referred to as 'routes/main'>`": [
             ":nxt_ph:`... <Any acceptable route array may go here; see the 'Route Steps' section for details>`"
         ],

         ":nxt_hint:`route66 <Named route, referred to as 'routes/route66'>`": [
             ":nxt_ph:`... <Any acceptable route array may go here; see the 'Route Steps' section for details>`"
         ]
     }
}
```

<a id="configuration-routes-step"></a>

### Route steps

A
[route](#configuration-routes)
array contains step objects as elements;
they accept the following options:

| Option                | Description                                                                                        |
|-----------------------|----------------------------------------------------------------------------------------------------|
| **action** (required) | Object;<br/>defines how matching requests are<br/>[handled](#configuration-routes-action).         |
| **match**             | Object;<br/>defines the step’s<br/>[conditions](#configuration-routes-matching)<br/>to be matched. |

A request passed to a route traverses its steps sequentially:

- If all **match** conditions in a step are met,
  the traversal ends
  and the step’s **action** is performed.
- If a step’s condition isn’t met,
  Unit proceeds to the next step of the route.
- If no steps of the route match,
  a 404 “Not Found” response is returned.

#### WARNING
If a step omits the **match** option,
its **action** occurs automatically.
Thus, use no more than one such step per route,
always placing it last to avoid potential routing issues.

A basic one:

```json
{
    "routes": [
        {
            "match": {
                "host": "example.com",
                "scheme": "https",
                "uri": "/php/*"
            },

            "action": {
                "pass": "applications/php_version"
            }
        },
        {
            "action": {
                "share": "/www/static_version$uri"
            }
        }
    ]
}
```

This route passes all HTTPS requests
to the **/php/** subsection of the **example.com** website
to the **php_version** app.
All other requests are served with static content
from the **/www/static_version/** directory.
If there’s no matching content,
a 404 “Not Found” response is returned.

A more elaborate example with chained routes and proxying:

```json
{
    "routes": {
        "main": [
            {
                "match": {
                    "scheme": "http"
                },

                "action": {
                    "pass": "routes/http_site"
                }
            },
            {
                "match": {
                    "host": "blog.example.com"
                },

                "action": {
                    "pass": "applications/blog"
                }
            },
            {
                "match": {
                    "uri": [
                        "*.css",
                        "*.jpg",
                        "*.js"
                    ]
                },

                "action": {
                    "share": "/www/static$uri"
                }
            }
        ],

        "http_site": [
            {
                "match": {
                    "uri": "/v2_site/*"
                },

                "action": {
                    "pass": "applications/v2_site"
                }
            },
            {
                "action": {
                    "proxy": "http://127.0.0.1:9000"
                }
            }
        ]
    }
}
```

Here, a route called **main** is explicitly defined,
so **routes** is an object instead of an array.
The first step of the route passes all HTTP requests
to the **http_site** app.
The second step passes all requests
that target **blog.example.com**
to the **blog** app.
The final step serves requests for certain file types
from the **/www/static/** directory.
If no steps match,
a 404 “Not Found” response is returned.

<a id="configuration-routes-matching"></a>

### Matching conditions

Conditions in a
[route step](#configuration-routes-step)’s
**match** object
define patterns to be compared to the request’s properties:

| Property        | Patterns Are Matched Against                                                                                                                                                                                                                                                                                                                                                                                            | Case‑   |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| **arguments**   | Arguments supplied with the request’s<br/>[query string](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4);<br/>these names and value pairs are<br/>[percent decoded](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1),<br/>with plus signs<br/>(**+**)<br/>replaced by spaces.                                                                                                                      | Yes     |
| **cookies**     | Cookies supplied with the request.                                                                                                                                                                                                                                                                                                                                                                                      | Yes     |
| **destination** | Target IP address and optional port of the request.                                                                                                                                                                                                                                                                                                                                                                     | No      |
| **headers**     | [Header fields](https://datatracker.ietf.org/doc/html/rfc9110#section-6.3)<br/>supplied with the request.                                                                                                                                                                                                                                                                                                               | No      |
| **host**        | **Host**<br/>[header field](https://datatracker.ietf.org/doc/html/rfc9110#section-7.2),<br/>converted to lower case and normalized<br/>by removing the port number and the trailing period<br/>(if any).                                                                                                                                                                                                                | No      |
| **method**      | [Method](https://datatracker.ietf.org/doc/html/rfc7231#section-4)<br/>from the request line,<br/>uppercased.                                                                                                                                                                                                                                                                                                            | No      |
| **query**       | [Query string](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4),<br/>[percent decoded](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1),<br/>with plus signs<br/>(**+**)<br/>replaced by spaces.                                                                                                                                                                                                    | Yes     |
| **scheme**      | URI<br/>[scheme](https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml).<br/>Accepts only two patterns,<br/>either **http** or **https**.                                                                                                                                                                                                                                                                      | No      |
| **source**      | Source IP address and optional port of the request.                                                                                                                                                                                                                                                                                                                                                                     | No      |
| **uri**         | [Request target](https://datatracker.ietf.org/doc/html/rfc9110#target.resource),<br/>[percent decoded](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1)<br/>and normalized<br/>by removing the<br/>[query string](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4)<br/>and resolving<br/>[relative references](https://datatracker.ietf.org/doc/html/rfc3986#section-4.2)<br/>(“.” and “..”, “//”). | Yes     |

Both **arguments** and **query** operate on the query string,
but **query** is matched against the entire string
whereas **arguments** considers only the key-value pairs
such as **key1=4861&key2=a4f3**.

Use **arguments** to define conditions
based on key-value pairs in the query string:

```json
"arguments": {
   "key1": "4861",
   "key2": "a4f3"
}
```

Argument order is irrelevant:
**key1=4861&key2=a4f3** and **key2=a4f3&key1=4861**
are considered the same.
Also, multiple occurrences of an argument must all match,
so **key=4861&key=a4f3** matches this:

```json
"arguments":{
    "key": "*"
}
```

But not this:

```json
"arguments":{
    "key": "a*"
}
```

To the contrary,
use **query**
if your conditions concern query strings
but don’t rely on key-value pairs:

```json
"query": [
    "utf8",
    "utf16"
]
```

This only matches query strings
of the form
**https://example.com?utf8** or **https://example.com?utf16**.

<a id="configuration-routes-matching-resolution"></a>

#### Match resolution

To be a match,
the property must meet two requirements:

- If there are patterns without negation
  (the **!** prefix),
  at least one of them matches the property value.
- No negated patterns match the property value.

This logic can be described with set operations.
Suppose set *U* comprises all possible values of a property;
set *P* comprises strings that match any patterns without negation;
set *N* comprises strings that match any negation-based patterns.
In this scheme,
the matching set is:

*U* ∩ *P* \\ *N* if *P* ≠ ∅
<br/>
*U* \\ *N* if *P* = ∅
<br/>

Here, the URI of the request must fit **pattern3**,
but must not match **pattern1** or **pattern2**:

```json
{
    "match": {
        "uri": [
            "!pattern1",
            "!pattern2",
            "pattern3"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Additionally, special matching logic applies to
**arguments**, **cookies**, and **headers**.
Each of these can be either
a single object that lists custom-named properties and their patterns
or an array of such objects.

To match a single object,
the request must match *all* properties named in the object.
To match an object array,
it’s enough to match *any* single one of its item objects.
The following condition matches only
if the request arguments include **arg1** and **arg2**,
and both match their patterns:

```json
{
    "match": {
        "arguments": {
            "arg1": "pattern",
            "arg2": "pattern"
        }
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

With an object array,
the condition matches
if the request’s arguments include
**arg1** or **arg2**
(or both)
that matches the respective pattern:

```json
{
    "match": {
        "arguments": [
            {
                "arg1": "pattern"
            },
            {
                "arg2": "pattern"
            }
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

The following example combines all matching types.
Here, **host**, **method**, **uri**,
**arg1** *and* **arg2**,
either **cookie1** or **cookie2**,
and either **header1** or **header2** *and* **header3**
must be matched
for the **action** to be taken
(**host & method & uri & arg1 & arg2 & (cookie1 | cookie2)
& (header1 | (header2 & header3))**):

```json
{
    "match": {
        "host": "pattern",
        "method": "!pattern",
        "uri": [
            "pattern",
            "!pattern"
        ],

        "arguments": {
            "arg1": "pattern",
            "arg2": "!pattern"
        },

        "cookies": [
            {
                "cookie1": "pattern",
            },
            {
                "cookie2": "pattern",
            }
        ],

        "headers": [
            {
                "header1": "pattern",
            },
            {
                "header2": "pattern",
                "header3": "pattern"
            }
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

This requires **mode=strict**
and any **access** argument other than **access=full**
in the URI query:

```json
{
    "match": {
        "arguments": {
            "mode": "strict",
            "access": "!full"
        }
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

This matches requests that
either use **gzip** and identify as **Mozilla/5.0**
or list **curl** as the user agent:

```json
{
    "match": {
        "headers": [
            {
                "Accept-Encoding": "*gzip*",
                "User-Agent": "Mozilla/5.0*"
            },
            {
                "User-Agent": "curl*"
            }
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

<a id="configuration-routes-matching-patterns"></a>

#### Pattern syntax

Individual patterns can be
address-based
(**source** and **destination**)
or string-based
(other properties).

String-based patterns must match the property to a character;
wildcards or

modify this behavior:

- A wildcard pattern may contain any combination of wildcards
  (**\***),
  each standing for an arbitrary number of characters:
  **How\*s\*that\*to\*you**.

<a id="configuration-routes-matching-patterns-regex"></a>
- A regex pattern starts with a tilde
  (**~**):
  **~^\\d+\\.\\d+\\.\\d+\\.\\d+**
  (escaping backslashes is a
  [JSON requirement](https://www.json.org/json-en.html)).
  The regexes are
  [PCRE](https://www.pcre.org/current/doc/html/pcre2syntax.html)-flavored.

Argument names, non-regex string patterns in **arguments**,
**query**, and **uri** can be
[percent encoded](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1)
to mask special characters
(**!** is **%21**, **~** is **%7E**,
**\*** is **%2A**, **%** is **%25**)
or even target single bytes.
For example, you can select diacritics such as Ö or Å
by their starting byte **0xC3** in UTF-8:

```json
{
    "match": {
        "arguments": {
            "word": "*%C3*"
        }
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Unit decodes such strings
and matches them against respective request entities,
decoding these as well:

```json
{
    "routes": [
        {
            "match": {
                "query": ":nxt_ph:`%7E <Tilde>`fuzzy word search"
            },

            "action": {
                "return": 200
            }
        }
    ]
}
```

This condition matches the following percent-encoded request:

```bash
$ curl http://127.0.0.1/?~fuzzy:nxt_ph:`%20 <Space>`word:nxt_ph:`%20 <Space>`search -v

      > GET /?~fuzzy%20word%20search HTTP/1.1
      ...
      < HTTP/1.1 200 OK
      ...
```

Note that the encoded spaces
(**%20**)
in the request
match their unencoded counterparts in the pattern;
vice versa, the encoded tilde
(**%7E**)
in the condition matches **~** in the request.

A regular expression that matches any **.php** files
in the **/data/www/** directory and its subdirectories.
Note the backslashes;
escaping is a JSON-specific requirement:

```json
{
    "match": {
        "uri": "~^/data/www/.*\\.php(/.*)?$"
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Only subdomains of **example.com** match:

```json
{
    "match": {
        "host": "*.example.com"
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Only requests for **.php** files
located in **/admin/**’s subdirectories
match:

```json
{
    "match": {
        "uri": "/admin/*/*.php"
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Here, any **eu-** subdomains of **example.com** match
except **eu-5.example.com**:

```json
{
    "match": {
        "host": [
            "eu-*.example.com",
            "!eu-5.example.com"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Any methods match
except **HEAD** and **GET**:

```json
{
    "match": {
        "method": [
            "!HEAD",
            "!GET"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

You can also combine certain special characters in a pattern.
Here, any URIs match
except the ones containing **/api/**:

```json
{
    "match": {
        "uri": "!*/api/*"
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Here, URIs of any articles
that don’t look like **YYYY-MM-DD** dates
match.
Again, note the backslashes;
they are a JSON requirement:

```json
{
    "match": {
        "uri": [
            "/articles/*",
            "!~/articles/\\d{4}-\\d{2}-\\d{2}"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Address-based patterns define individual IPv4
(dot-decimal or
[CIDR](https://datatracker.ietf.org/doc/html/rfc4632)),
IPv6 (hexadecimal or
[CIDR](https://datatracker.ietf.org/doc/html/rfc4291#section-2.3)),
or any
[UNIX domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket)
addresses
that must exactly match the property;
wildcards and ranges modify this behavior:

- Wildcards
  (**\***)
  can only match arbitrary IPs
  (**\*:<port>**).
- Ranges
  (**-**)
  work with both IPs
  (in respective notation)
  and ports
  (**<start_port>-<end_port>**).

Addresses come in handy
when implementing an allow-deny mechanism
with routes,
for instance:

```json
"routes": [
    {
        "match": {
            "source": [
                "!192.168.1.1",
                "!10.1.1.0/16",
                "192.168.1.0/24",
                "2001:0db8::/32"
            ]
        },

        "action": {
            "share": "/www/data$uri"
        }
    }
]
```

See
[here](#configuration-routes-matching-resolution)
for details of pattern resolution order;
this corresponds to the following **nginx** directive:

```nginx
location / {
    deny  10.1.1.0/16;
    deny  192.168.1.1;
    allow 192.168.1.0/24;
    allow 2001:0db8::/32;
    deny  all;

    root /www/data;
}
```

This uses IPv4-based matching with wildcards and ranges:

```json
{
    "match": {
        "source": [
            "192.0.2.1-192.0.2.200",
            "198.51.100.1-198.51.100.200:8000",
            "203.0.113.1-203.0.113.200:8080-8090",
            "*:80"
        ],

        "destination": [
            "192.0.2.0/24",
            "198.51.100.0/24:8000",
            "203.0.113.0/24:8080-8090",
            "*:80"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

This uses IPv6-based matching with wildcards and ranges:

```json
{
    "match": {
        "source": [
             "2001:0db8::-2001:0db8:aaa9:ffff:ffff:ffff:ffff:ffff",
             "[2001:0db8:aaaa::-2001:0db8:bbbb::]:8000",
             "[2001:0db8:bbbb::1-2001:0db8:cccc::]:8080-8090",
             "*:80"
        ],

        "destination": [
             "2001:0db8:cccd::/48",
             "[2001:0db8:ccce::/48]:8000",
             "[2001:0db8:ccce:ffff::/64]:8080-8090",
             "*:80"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

This matches any of the listed IPv4 or IPv6 addresses:

```json
{
    "match": {
        "destination": [
            "127.0.0.1",
            "192.168.0.1",
            "::1",
            "2001:0db8:1::c0a8:1"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

Here, any IPs from the range match
except **192.0.2.9**:

```json
{
    "match": {
        "source": [
            "192.0.2.1-192.0.2.10",
            "!192.0.2.9"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

This matches any IPs but limits the acceptable ports:

```json
{
    "match": {
        "source": [
            "*:80",
            "*:443",
            "*:8000-8080"
        ]
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

This matches any UNIX domain sockets:

```json
{
    "match": {
        "source": "unix"
    },

    "action": {
        "pass": ":nxt_ph:`... <Any acceptable 'pass' value may go here; see the 'Listeners' section for details>`"
    }
}
```

<a id="configuration-routes-action"></a>

### Handling actions

If a request matches all
[conditions](#configuration-routes-matching)
of a route step
or the step itself omits the **match** object,
Unit handles the request with the respective **action**.
The mutually exclusive **action** types are:

| Option     | Description                                                                 | Details                                               |
|------------|-----------------------------------------------------------------------------|-------------------------------------------------------|
| **pass**   | Destination for the request,<br/>identical to a listener’s **pass** option. | [Listeners](#configuration-listeners)                 |
| **proxy**  | Socket address of an HTTP server<br/>to where the request is proxied.       | [Proxying](#configuration-proxy)                      |
| **return** | HTTP status code<br/>with a context-dependent redirect location.            | [Instant responses, redirects](#configuration-return) |
| **share**  | File paths that serve the request with static content.                      | [Static files](#configuration-static)                 |

An additional option is applicable to any of these actions:

| Option               | Description                                               | Details                                             |
|----------------------|-----------------------------------------------------------|-----------------------------------------------------|
| **response_headers** | Updates the header fields<br/>of the upcoming response.   | [Response headers](#configuration-response-headers) |
| **rewrite**          | Updated the request URI,<br/>preserving the query string. | [URI rewrite](#configuration-rewrite)               |

An example:

```json
{
    "routes": [
        {
            "match": {
                "uri": [
                    "/v1/*",
                    "/v2/*"
                ]
            },

            "action": {
                "rewrite": "/app/$uri",
                "pass": "applications/app"
            }
        },
        {
            "match": {
                "uri": "~\\.jpe?g$"
            },

            "action": {
                "share": [
                    "/var/www/static$uri",
                    "/var/www/static/assets$uri"
                 ],

                "fallback": {
                     "pass": "upstreams/cdn"
                }
            }
        },
        {
            "match": {
                "uri": "/proxy/*"
            },

            "action": {
                "proxy": "http://192.168.0.100:80"
            }
        },
        {
            "match": {
                "uri": "/return/*"
            },

            "action": {
                "return": 301,
                "location": "https://www.example.com"
            }
        }
    ]
}
```

<a id="configuration-variables"></a>

<a id="configuration-variables-native"></a>

## Variables

Some options in Unit configuration
allow the use of
[variables](#configuration-variables-native)
whose values are calculated at runtime.
There’s a number of built-in variables available:

| Variable                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **arg_\***, **cookie_\***, **header_\*** | Variables that store<br/>[request arguments, cookies, and header fields](#configuration-routes-matching),<br/>such as **arg_queryTimeout**,<br/>**cookie_sessionId**,<br/>or **header_Accept_Encoding**.<br/>The names of the **header_\*** variables are case insensitive.                                                                                                                                                                                                                                                                             |
| **body_bytes_sent**                      | Number of bytes sent in the response body.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **dollar**                               | Literal dollar sign (**$**),<br/>used for escaping.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **header_referer**                       | Contents of the **Referer** request<br/>[header field](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer).                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **header_user_agent**                    | Contents of the **User-Agent** request<br/>[header field](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent).                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **host**                                 | **Host**<br/>[header field](https://datatracker.ietf.org/doc/html/rfc9110#section-7.2),<br/>converted to lower case and normalized<br/>by removing the port number<br/>and the trailing period (if any).                                                                                                                                                                                                                                                                                                                                                |
| **method**                               | [Method](https://datatracker.ietf.org/doc/html/rfc7231#section-4)<br/>from the request line.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **remote_addr**                          | Remote IP address of the request.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **request_id**                           | Contains a string generated with random data. Can be used as a unique<br/>request identifier.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **request_line**                         | Entire<br/>[request line](https://datatracker.ietf.org/doc/html/rfc9112#section-3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **request_time**                         | Request processing time in milliseconds,<br/>formatted as follows:<br/>**1.234**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **request_uri**                          | Request target<br/>[path](https://datatracker.ietf.org/doc/html/rfc3986#section-3.3)<br/>*including* the<br/>[query](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4),<br/>normalized by resolving relative path references<br/>(“.” and “..”)<br/>and collapsing adjacent slashes.                                                                                                                                                                                                                                                           |
| **response_header_\***                   | Variables that store<br/>[response header fields](#configuration-response-headers),<br/>such as **response_header_content_type**.<br/>The names of these variables are case insensitive.                                                                                                                                                                                                                                                                                                                                                                |
| **status**                               | HTTP<br/>[status code](https://datatracker.ietf.org/doc/html/rfc7231#section-6)<br/>of the response.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **time_local**                           | Local time,<br/>formatted as follows:<br/>**31/Dec/1986:19:40:00 +0300**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **uri**                                  | Request target<br/>[path](https://datatracker.ietf.org/doc/html/rfc3986#section-3.3)<br/>*without* the [query](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4)<br/>part,<br/>normalized by resolving relative path references<br/>(“.” and “..”)<br/>and collapsing adjacent slashes.<br/>The value is<br/>[percent decoded](https://datatracker.ietf.org/doc/html/rfc3986#section-2.1):<br/>Unit interpolates all percent-encoded entities<br/>in the request target<br/>[path](https://datatracker.ietf.org/doc/html/rfc3986#section-3.3). |

These variables can be used with:

- **pass** in
  [listeners](#configuration-listeners)
  and
  [actions](#configuration-routes-action)
  to choose between routes, applications, app targets, or upstreams.
- **rewrite** in
  [actions](#configuration-routes-action)
  to enable [URI rewriting](#configuration-rewrite).
- **share** and **chroot** in
  [actions](#configuration-routes-action)
  to control
  [static content serving](#configuration-static).
- **location** in **return**
  [actions](#configuration-return)
  to enable HTTP redirects.
- **format** in the
  [access log](#configuration-access-log)
  to customize Unit’s log output.

To reference a variable,
prefix its name with the dollar sign character
(**$**),
optionally enclosing the name in curly brackets
(**{}**)
to separate it from adjacent text
or enhance visibility.
Variable names can contain letters and underscores
(**\_**),
so use the brackets
if the variable is immediately followed by such characters:

```json
{
    "listeners": {
        "*:80": {
            "pass": "routes/:nxt_hint:`${method} <The method variable is thus separated from the '_route' postfix>`_route"
        }
    },

    "routes": {
        "GET_route": [
            {
                "action": {
                    "return": 201
                }
            }
        ],

        "PUT_route": [
            {
                "action": {
                    "return": 202
                }
            }
        ],

        "POST_route": [
            {
                "action": {
                    "return": 203
                }
            }
        ]
    }
}
```

To reference an **arg_\***,
**cookie_\***,
or **header_\*** variable,
add the name you need to the prefix.
A query string of **Type=car&Color=red**
yields two variables,
**$arg_Type** and **$arg_Color**;
Unit additionally normalizes capitalization and hyphenation
in header field names,
so the **Accept-Encoding** header field
can also be referred to as **$header_Accept_Encoding**,
**$header_accept-encoding**,
or **$header_accept_encoding**.

#### NOTE
With multiple argument instances
(think **Color=Red&Color=Blue**),
the rightmost one is used (**Blue**).

At runtime,
variables expand into dynamically computed values
(at your risk!).
The previous example targets an entire set of routes,
picking individual ones by HTTP verbs
from the incoming requests:

```bash
$ curl -i -X GET http://localhost

    HTTP/1.1 201 Created

$ curl -i -X PUT http://localhost

    HTTP/1.1 202 Accepted

$ curl -i -X POST http://localhost

    HTTP/1.1 203 Non-Authoritative Information

$ curl -i --head http://localhost  # Bumpy ride ahead, no route defined

    HTTP/1.1 404 Not Found
```

If you reference a non-existing variable,
it is considered empty.

This configuration selects the static file location
based on the requested hostname;
if nothing’s found,
it attempts to retrieve the requested file
from a common storage:

```json
{
    "listeners": {
        "*:80": {
            "pass": "routes"
        }
    },

    "routes": [
        {
            "action": {
                "share": [
                    "/www/$host:nxt_hint:`$uri <Note that the $uri variable value always includes a starting slash>`",
                    "/www/storage:nxt_hint:`$uri <Note that the $uri variable value always includes a starting slash>`"
                ]
            }
        }
    ]
}
```

Another use case is employing the URI
to choose between applications:

```json
{
    "listeners": {
        "*:80": {
            "pass": "applications:nxt_hint:`$uri <Note that the $uri variable value always includes a starting slash>`"
        }
    },

    "applications": {
        "blog": {
            "root": "/path/to/blog_app/",
            "script": "index.php"
        },

        "sandbox": {
            "type": "php",
            "root": "/path/to/sandbox_app/",
            "script": "index.php"
        }
    }
}
```

This way, requests are routed between applications by their target URIs:

```bash
$ curl http://localhost/blog     # Targets the 'blog' app
$ curl http://localhost/sandbox  # Targets the 'sandbox' app
```

A different approach puts the **Host** header field
received from the client
to the same use:

```json
{
    "listeners": {
        "*:80": {
            "pass": "applications/$host"
        }
    },

    "applications": {
        "localhost": {
            "root": "/path/to/admin_section/",
            "script": "index.php"
        },

        "www.example.com": {
            "type": "php",
            "root": "/path/to/public_app/",
            "script": "index.php"
        }
    }
}
```

You can use multiple variables in a string,
repeating and placing them arbitrarily.
This configuration picks an app target
(supported for
[PHP](#configuration-php-targets)
and
[Python](#configuration-python-targets)
apps)
based on the requested hostname and URI:

```json
{
    "listeners": {
        "*:80": {
            "pass": "applications/app_$host:nxt_hint:`$uri <Note that the $uri value doesn't include the request's query part>`"
        }
    }
}
```

At runtime,
a request for **example.com/myapp**
is passed to **applications/app_example.com/myapp**.

To select a share directory
based on an **app_session** cookie:

```json
{
    "action": {
        "share": "/data/www/$cookie_app_session"
    }
}
```

Here, if **$uri** in **share** resolves to a directory,
the choice of an index file to be served
is dictated by **index**:

```json
{
    "action": {
        "share": "/www/data:nxt_hint:`$uri <Note that the $uri variable value always includes a starting slash>`",
        "index": "index.htm"
    }
}
```

Here, a redirect uses the **$request_uri** variable value
to relay the request,
*including* the query part,
to the same website over HTTPS:

```json
{
    "action": {
        "return": 301,
        "location": "https://$host$request_uri"
    }
}
```

<a id="configuration-rewrite"></a>

## URI rewrite

All route step
[actions](#configuration-routes-action)
support the **rewrite** option
that updates the URI of the incoming request
before the action is applied.
It does not affect the
[query](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4)
but changes the
**uri** and
**$request_uri**
[variables](#configuration-variables).

This **match**-less action
prefixes the request URI with **/v1**
and returns it to routing:

```json
{
    "action": {
        "rewrite": "/v1$uri",
        "pass": "routes"
    }
}
```

#### WARNING
Avoid infinite loops
when you  **pass** requests
back to **routes**.

This action
normalizes the request URI
and passes it to an application:

```json
{
    "match": {
        "uri": [
            "/fancyAppA",
            "/fancyAppB"
        ]
    },

    "action": {
        "rewrite": "/commonBackend",
        "pass": "applications/backend"
    }
}
```

<a id="configuration-response-headers"></a>

## Response headers

All route step
[actions](#configuration-routes-action)
support the **response_headers** option
that updates the header fields of Unit’s response
before the action is taken:

```json
{
    "action": {
        "share": "/www/static/$uri",
        "response_headers": {
            "Cache-Control": "max-age=60, s-maxage=120",
            "CDN-Cache-Control": "max-age=600"
        }
    }
}
```

This works only for the **2XX** and **3XX** responses;
also, **Date**, **Server**, and **Content-Length** can’t be set.

The option sets given string values
for the header fields of the response
that Unit will send for the specific request:

- If there’s no header field associated with the name
  (regardless of the case),
  the value is set.
- If a header field with this name is already set, its value is updated.
- If **null** is supplied for the value, the header field is *deleted*.

If the action is taken and Unit issues a response,
it sends the header fields *this specific* action specifies.
Only the last action
along the entire routing path of a request
affects the resulting response headers.

The values support
[variables](#configuration-variables)
and
[template literals](scripting.md),
which enables arbitrary runtime logic:

```json
"response_headers": {
    "Content-Language": "`${ uri.startsWith('/uk') ? 'en-GB' : 'en-US' }`"
}
```

Finally, there are the **response_header_\*** variables
that evaluate to the header field values set with the response
(by the app, upstream, or Unit itself;
the latter is the case with
**$response_header_connection**,
**$response_header_content_length**,
and **$response_header_transfer_encoding**).

One use is to update the headers in the final response;
this extends the **Content-Type** issued by the app:

```json
"action": {
    "pass": "applications/converter",
        "response_headers": {
            "Content-Type": "${response_header_content_type};charset=iso-8859-1"
        }
    }
}
```

Alternatively, they will come in handy with
[custom log formatting](#configuration-access-log).

<a id="configuration-return"></a>

## Instant responses, redirects

You can use route step
[actions](#configuration-routes-action)
to instantly handle certain conditions
with arbitrary
[HTTP status codes](https://datatracker.ietf.org/doc/html/rfc7231#section-6):

```json
{
    "match": {
        "uri": "/admin_console/*"
    },

    "action": {
        "return": 403
    }
}
```

The **return** action provides the following options:

| **return** (required)   | Integer (000–999);<br/>defines the HTTP response status code<br/>to be returned.   |
|-------------------------|------------------------------------------------------------------------------------|
| **location**            | String URI;<br/>used if the **return** value implies redirection.                  |

Use the codes according to their intended
[semantics](https://datatracker.ietf.org/doc/html/rfc7231#section-6);
if you use custom codes,
make sure that user agents can understand them.

If you specify a redirect code (3xx),
supply the destination
using the **location** option
alongside **return**:

```json
{
    "action": {
        "return": 301,
        "location": "https://www.example.com"
    }
}
```

Besides enriching the response semantics,
**return** simplifies [allow-deny lists](#allow-deny):
instead of guarding each action with a filter,
add
[conditions](#configuration-routes-matching)
to deny unwanted requests as early as possible,
for example:

```json
"routes": [
    {
        "match": {
            "scheme": "http"
        },

        "action": {
            "return": 403
        }
    },
    {
        "match": {
            "source": [
                "!192.168.1.1",
                "!10.1.1.0/16",
                "192.168.1.0/24",
                "2001:0db8::/32"
            ]
        },

        "action": {
            "return": 403
        }
    }
]
```

<a id="configuration-static"></a>

## Static files

Unit is capable of acting as a standalone web server,
efficiently serving static files
from the local file system;
to use the feature,
list the file paths
in the **share** option
of a route step
[action](#configuration-routes-action).

A **share**-based action provides the following options:

| **share** (required)                     | String or an array of strings;<br/>lists file paths that are tried<br/>until a file is found.<br/>When no file is found,<br/>**fallback** is used if set.<br/><br/>The value is<br/>[variable](#configuration-variables)-interpolated.                                                                                           |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **index**                                | Filename;<br/>tried if **share** is a directory.<br/>When no file is found,<br/>**fallback** is used if set.<br/><br/>The default is **index.html**.                                                                                                                                                                             |
| **fallback**                             | Action-like [object](#configuration-fallback);<br/>used if the request<br/>can’t be served by **share** or **index**.                                                                                                                                                                                                            |
| **types**                                | [Array](#configuration-share-mime)<br/>of<br/>[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml)<br/>patterns;<br/>used to filter the shared files.                                                                                                                                                     |
| **chroot**                               | Directory pathname that<br/>[restricts](#configuration-share-path)<br/>the shareable paths.<br/><br/>The value is<br/>[variable](#configuration-variables)-interpolated.                                                                                                                                                         |
| **follow_symlinks**, **traverse_mounts** | Booleans;<br/>turn on and off symbolic link and mount point<br/>[resolution](#configuration-share-resolution)<br/>respectively;<br/>if **chroot** is set,<br/>they only<br/>[affect](#configuration-share-path)<br/>the insides of **chroot**.<br/><br/>The default for both options is **true**<br/>(resolve links and mounts). |

#### NOTE
To serve the files,
Unit’s router process must be able to access them;
thus, the account this process runs as
must have proper permissions
[assigned](howto/security.md#security-apps).
When Unit is installed from the
[official packages](installation.md#installation-precomp-pkgs),
the process runs as **unit:unit**;
for details of other installation methods,
see [Installation](installation.md).

Consider the following configuration:

```json
{
    "listeners": {
        "*:80": {
            "pass": "routes"
        }
     },

    "routes": [
        {
            "action": {
                "share": "/www/static/$uri"
            }
        }
    ]
}
```

It uses
[variable interpolation](#configuration-variables):
Unit replaces the **$uri** reference
with its current value
and tries the resulting path.
If this doesn’t yield a servable file,
a 404 “Not Found” response is returned.

#### WARNING
Before version 1.26.0,
Unit used **share** as the document root.
This was changed for flexibility,
so now **share** must resolve to specific files.
A common solution is
to append **$uri** to your document root.

Pre-1.26,
the snippet above would’ve looked like this:

```json
"action": {
    "share": "/www/static/"
}
```

Mind that URI paths always start with a slash,
so there’s no need to separate the directory
from **$uri**;
even if you do, Unit compacts adjacent slashes
during path resolution,
so there won’t be an issue.

If **share** is an array,
its items are searched in order of appearance
until a servable file is found:

```json
"share": [
    "/www/$host$uri",
    "/www/error_pages/not_found.html"
]
```

This snippet tries a **$host**-based directory first;
if a suitable file isn’t found there,
the **not_found.html** file is tried.
If neither is accessible,
a 404 “Not Found” response is returned.

Finally, if a file path points to a directory,
Unit attempts to serve an **index**-indicated file from it.
Suppose we have the following directory structure
and share configuration:

```none
/www/static/
├── ...
└──default.html
```

```json
"action": {
    "share": "/www/static$uri",
    "index": "default.html"
}
```

The following request returns **default.html**
even though the file isn’t named explicitly:

```bash
$ curl http://localhost/ -v

 ...
 < HTTP/1.1 200 OK
 < Last-Modified: Fri, 20 Sep 2021 04:14:43 GMT
 < ETag: "5d66459d-d"
 < Content-Type: text/html
 < Server: Unit/1.32.1
 ...
```

#### NOTE
Unit’s ETag response header fields
use the **MTIME-FILESIZE** format,
where **MTIME** stands for file modification timestamp
and **FILESIZE** stands for file size in bytes,
both in hexadecimal.

<a id="configuration-share-mime"></a>

### MIME filtering

To filter the files a **share** serves
by their
[MIME types](https://www.iana.org/assignments/media-types/media-types.xhtml),
define a **types** array of string patterns.
They work like
[route patterns](#configuration-routes-matching-patterns)
but are compared to the MIME type of each file;
the request is served only if it’s a
[match](#configuration-routes-matching-resolution):

```json
{
    "share": "/www/data/static$uri",
    "types": [
        "!text/javascript",
        "!text/css",
        "text/*",
        "~video/3gpp2?"
    ]
}
```

This sample configuration blocks JS and CSS files with
[negation](#configuration-routes-matching-resolution)
but allows all other text-based MIME types with a
[wildcard pattern](#configuration-routes-matching-patterns).
Additionally, the **.3gpp** and **.3gpp2** file types
are allowed by a
[regex pattern](#configuration-routes-matching-patterns).

If no MIME types match the request, a 403 “Forbidden” response is
returned. You can pair that behavior with a
[fallback](#configuration-fallback) option that will be called
when a 40x response would be returned.

```json
{
    "share": "/www/data/static$uri",
    "types": ["image/*", "font/*", "text/*"],
    "response_headers": {
        "Cache-Control": "max-age=1209600"
    },
    "fallback": {
        "share": "/www/data/static$uri",
    }
}
```

Here, all requests to images, fonts, and any text-based files will have
a cache control header added to the response. Any other requests will still
serve the files, but this time without the header. This is useful
for serving common web page resources that do not change; web browsers
and proxies are informed that this content should be cached.

If the MIME type of a requested file isn’t recognized,
it’s considered empty
(**“”**).
Thus, the **“!”** pattern
(“deny empty strings”)
can be used to restrict all file types
[unknown](#configuration-mime)
to Unit:

```json
{
    "share": "/www/data/known-types-only$uri",
    "types": [
        "!"
    ]
}
```

If a share path specifies only the directory name,
Unit *doesn’t* apply MIME filtering.

<a id="configuration-share-path"></a>

### Path restrictions

#### NOTE
To have these options,
Unit must be built and run
on a system with Linux kernel version 5.6+.

The **chroot** option confines the path resolution
within a share to a certain directory.
First, it affects symbolic links:
any attempts to go up the directory tree
with relative symlinks like **../../var/log**
stop at the **chroot** directory,
and absolute symlinks are treated as relative
to this directory to avoid breaking out:

```json
{
    "action": {
        "share": "/www/data$uri",
        "chroot": ":nxt_hint:`/www/data/ <Now, any paths accessible via the share are confined to this directory>`"
    }
}
```

Here, a request for **/log**
initially resolves to **/www/data/log**;
however, if that’s an absolute symlink to **/var/log/app.log**,
the resulting path is **/www/data/var/log/app.log**.

Another effect is that any requests
for paths that resolve outside the **chroot** directory
are forbidden:

```json
{
    "action": {
        "share": "/www$uri",
        "chroot": ":nxt_hint:`/www/data/ <Now, any paths accessible via the share are confined to this directory>`"
    }
}
```

Here, a request for **/index.xml**
elicits a 403 “Forbidden” response
because it resolves to **/www/index.xml**,
which is outside **chroot**.

<a id="configuration-share-resolution"></a>

The **follow_symlinks** and **traverse_mounts** options
disable resolution of symlinks and traversal of mount points
when set to **false**
(both default to **true**):

```json
{
    "action": {
        "share": "/www/$host/static$uri",
        "follow_symlinks": :nxt_hint:`false <Disables symlink traversal>`,
        "traverse_mounts": :nxt_hint:`false <Disables mount point traversal>`
    }
}
```

Here, any symlink or mount point in the entire **share** path
results in a 403 “Forbidden” response.

With **chroot** set,
**follow_symlinks** and **traverse_mounts**
only affect portions of the path *after* **chroot**:

```json
{
    "action": {
        "share": "/www/$host/static$uri",
        "chroot": "/www/$host/",
        "follow_symlinks": false,
        "traverse_mounts": false
    }
}
```

Here, **www/** and interpolated **$host**
can be symlinks or mount points,
but any symlinks and mount points beyond them,
including the **static/** portion,
won’t be resolved.

Suppose you want to serve files from a share
that itself includes a symlink
(let’s assume **$host** always resolves to **localhost**
and make it a symlink in our example)
but disable any symlinks inside the share.

Initial configuration:

```json
{
    "action": {
        "share": "/www/$host/static$uri",
        "chroot": ":nxt_hint:`/www/$host/ <Now, any paths accessible via the share are confined to this directory>`"
    }
}
```

Create a symlink to **/www/localhost/static/index.html**:

```bash
$ mkdir -p /www/localhost/static/ && cd /www/localhost/static/
$ cat > index.html << EOF

      > index.html
      > EOF

$ ln -s index.html /www/localhost/static/symlink
```

If symlink resolution is enabled
(with or without **chroot**),
a request that targets the symlink works:

```bash
$ curl http://localhost/index.html

      index.html

$ curl http://localhost/symlink

      index.html
```

Now set **follow_symlinks** to **false**:

```json
{
    "action": {
        "share": "/www/$host/static$uri",
        "chroot": ":nxt_hint:`/www/$host/ <Now, any paths accessible via the share are confined to this directory>`",
        "follow_symlinks": false
    }
}
```

The symlink request is forbidden,
which is presumably the desired effect:

```bash
$ curl http://localhost/index.html

      index.html

$ curl http://localhost/symlink

      <!DOCTYPE html><title>Error 403</title><p>Error 403.
```

Lastly, what difference does **chroot** make?
To see, remove it:

```json
{
    "action": {
        "share": "/www/$host/static$uri",
        "follow_symlinks": false
    }
}
```

Now, **“follow_symlinks”: false** affects the entire share,
and **localhost** is a symlink,
so it’s forbidden:

```bash
$ curl http://localhost/index.html

      <!DOCTYPE html><title>Error 403</title><p>Error 403.
```

<a id="configuration-fallback"></a>

### Fallback action

Finally, within an **action**,
you can supply a **fallback** option
beside a **share**.
It specifies the
[action](#configuration-routes-action)
to be taken
if the requested file can’t be served
from the **share** path:

```json
{
    "share": "/www/data/static$uri",
    "fallback": {
        "pass": "applications/php"
    }
}
```

Serving a file can be impossible for different reasons, such as:

- The request’s HTTP method isn’t **GET** or **HEAD**.
- The file’s MIME type doesn’t match the **types**
  [array](#configuration-share-mime).
- The file isn’t found at the **share** path.
- The router process has
  [insufficient permissions](howto/security.md#security-apps)
  to access the file or an underlying directory.

In the previous example,
an attempt to serve the requested file
from the **/www/data/static/** directory
is made first.
Only if the file can’t be served,
the request is passed to the **php** application.

If the **fallback** itself is a **share**,
it can also contain a nested **fallback**:

```json
{
    "share": "/www/data/static$uri",
    "fallback": {
        "share": "/www/cache$uri",
        "chroot": "/www/",
        "fallback": {
            "proxy": "http://127.0.0.1:9000"
        }
    }
}
```

The first **share** tries to serve the request
from **/www/data/static/**;
on failure, the second **share** tries the **/www/cache/** path
with **chroot** enabled.
If both attempts fail,
the request is proxied elsewhere.

One common use case that this feature enables
is the separation of requests
for static and dynamic content
into independent routes.
The following example relays all requests
that target **.php** files
to an application
and uses a catch-all static **share**
with a **fallback**:

```json
{
    "routes": [
        {
            "match": {
                "uri": "*.php"
            },

            "action": {
                "pass": "applications/php-app"
            }
        },
        {
            "action": {
                "share": "/www/php-app/assets/files$uri",
                "fallback": {
                    "proxy": "http://127.0.0.1:9000"
                }
            }
        }

    ],

    "applications": {
        "php-app": {
            "type": "php",
            "root": "/www/php-app/scripts/"
        }
    }
}
```

You can reverse this scheme for apps
that avoid filenames in dynamic URIs,
listing all types of static content
to be served from a **share**
in a **match** condition
and adding an unconditional application path:

```json
{
    "routes": [
        {
            "match": {
                "uri": [
                    "*.css",
                    "*.ico",
                    "*.jpg",
                    "*.js",
                    "*.png",
                    "*.xml"
                ]
            },

            "action": {
                "share": "/www/php-app/assets/files$uri",
                "fallback": {
                    "proxy": "http://127.0.0.1:9000"
                }
            }
        },
        {
            "action": {
                "pass": "applications/php-app"
            }
        }

    ],

    "applications": {
        "php-app": {
            "type": "php",
            "root": "/www/php-app/scripts/"
        }
    }
}
```

If image files should be served locally
and other proxied,
use the **types** array
in the first route step:

```json
{
    "match": {
        "uri": [
            "*.css",
            "*.ico",
            "*.jpg",
            "*.js",
            "*.png",
            "*.xml"
        ]
    },

    "action": {
        "share": "/www/php-app/assets/files$uri",
        "types": [
            "image/*"
        ],

        "fallback": {
            "proxy": "http://127.0.0.1:9000"
        }
    }
}
```

Another way to combine
**share**, **types**, and **fallback**
is exemplified by the following compact pattern:

```json
{
    "share": "/www/php-app/assets/files$uri",
    "types": [
        "!application/x-httpd-php"
    ],

    "fallback": {
        "pass": "applications/php-app"
    }
}
```

It forwards explicit requests for PHP files
to the app
while serving all other types of files
from the share;
note that a **match** object
isn’t needed here to achieve this effect.

<a id="configuration-proxy"></a>

## Proxying

Unit’s routes support HTTP proxying
to socket addresses
using the **proxy** option
of a route step
[action](#configuration-routes-action):

```json
{
    "routes": [
        {
            "match": {
                "uri": "/ipv4/*"
            },

            "action": {
                "proxy": ":nxt_hint:`http://127.0.0.1:8080 <Note that the http:// scheme is required>`"
            }
        },
        {
            "match": {
                "uri": "/ipv6/*"
            },

            "action": {
                "proxy": ":nxt_hint:`http://[::1]:8080 <Note that the http:// scheme is required>`"
            }
        },
        {
            "match": {
                "uri": "/unix/*"
            },

            "action": {
                "proxy": ":nxt_hint:`http://unix:/path/to/unix.sock <Note that the http:// scheme is required, followed by the unix: prefix>`"
            }
        }
    ]
}
```

As the example suggests,
you can use UNIX, IPv4, and IPv6 socket addresses
for proxy destinations.

#### NOTE
The HTTPS scheme is not supported yet.

<a id="configuration-upstreams"></a>

### Load balancing

Besides proxying requests to individual servers,
Unit can also relay incoming requests to *upstreams*.
An upstream is a group of servers
that comprise a single logical entity
and may be used as a **pass** destination
for incoming requests in a
[listener](#configuration-listeners)
or a
[route](#configuration-routes).

Upstreams are defined
in the eponymous **/config/upstreams** section of the API:

```json
{
    "listeners": {
        "*:80": {
            "pass": "upstreams/rr-lb"
        }
    },

    "upstreams": {
        ":nxt_hint:`rr-lb <Upstream object>`": {
            ":nxt_hint:`servers <Lists individual servers as object-valued options>`": {
                ":nxt_hint:`192.168.0.100:8080 <Empty object needed due to JSON requirements>`": {},
                "192.168.0.101:8080": {
                    "weight": 0.5
                }
            }
        }
    }
}
```

An upstream must define a **servers** object
that lists socket addresses
as server object names.
Unit dispatches requests between the upstream’s servers
in a round-robin fashion,
acting as a load balancer.
Each server object can set a numeric **weight**
to adjust the share of requests
it receives via the upstream.
In the above example,
**192.168.0.100:8080** receives twice as many requests
as **192.168.0.101:8080**.

Weights can be specified as integers or fractions
in decimal or scientific notation:

```json
{
    "servers": {
        "192.168.0.100:8080": {
            ":nxt_hint:`weight <All three values are equal>`": 1e1
        },

        "192.168.0.101:8080": {
            ":nxt_hint:`weight <All three values are equal>`": 10.0
        },

        "192.168.0.102:8080": {
            ":nxt_hint:`weight <All three values are equal>`": 10
        }
    }
}
```

The maximum weight is **1000000**,
the minimum is **0**
(such servers receive no requests);
the default is **1**.

<a id="configuration-applications"></a>

## Applications

Each app that Unit runs
is defined as an object
in the **/config/applications** section of the control API;
it lists the app’s language and settings,
its runtime limits,
process model,
and various language-specific options.

#### NOTE
Our official
[language-specific packages](installation.md#installation-precomp-pkgs)
include end-to-end examples of application configuration,
available for your reference at
**/usr/share/doc/<module name>/examples/**
after package installation.

Here, Unit runs 20 processes of a PHP app called **blogs**,
stored in the **/www/blogs/scripts/** directory:

```json
{
    "blogs": {
        "type": "php",
        "processes": 20,
        "root": "/www/blogs/scripts/"
    }
}
```

<a id="configuration-apps-common"></a>

App objects have a number of options
shared between all application languages:

| Option                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **type** (required)    | Application type:<br/>**external**<br/>(Go and Node.js),<br/>**java**,<br/>**perl**,<br/>**php**,<br/>**python**,<br/>**ruby**,<br/>or **wasm**<br/>(WebAssembly).<br/><br/>Except for **external** and **wasm**,<br/>you can detail the runtime version:<br/>**“type”: “python 3”**,<br/>**“type”: “python 3.4”**,<br/>or even<br/>**“type”: “python 3.4.9rc1”**.<br/>Unit searches its modules<br/>and uses the latest matching one,<br/>reporting an error if none match.<br/><br/>For example, if you have only one PHP module,<br/>7.1.9,<br/>it matches **“php”**,<br/>**“php 7”**,<br/>**“php 7.1”**,<br/>and **“php 7.1.9”**.<br/>If you have modules for versions 7.0.2 and 7.0.23,<br/>set **“type”: “php 7.0.2”** to specify the former;<br/>otherwise, PHP 7.0.23 will be used. |
| **environment**        | String-valued object;<br/>environment variables to be passed to the app.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **group**              | String;<br/>group name that runs the<br/>[app process](howto/security.md#sec-processes).<br/><br/>The default is the **user**’s primary group.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **isolation**          | Object; manages the isolation<br/>of an application process.<br/>For details, see<br/>[here](#configuration-proc-mgmt-isolation).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **limits**             | Object; accepts two integer options,<br/>**timeout** and **requests**.<br/>Their values govern the life cycle of an application process.<br/>For details, see<br/>[here](#configuration-proc-mgmt-lmts).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **processes**          | Integer or object;<br/>integer sets a static number of app processes,<br/>and object options **max**,<br/>**spare**,<br/>and **idle_timeout**<br/>enable dynamic management.<br/>For details, see<br/>[here](#configuration-proc-mgmt-prcs).<br/><br/>The default is 1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **stderr**, **stdout** | Strings;<br/>filenames where Unit redirects<br/>the application’s output.<br/><br/>The default is **/dev/null**.<br/><br/>When running in **--no-daemon** mode, application output<br/>is always redirected to<br/>[Unit’s log file](troubleshooting.md#troubleshooting-log).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **user**               | String;<br/>username that runs the<br/>[app process](howto/security.md#sec-processes).<br/><br/>The default is the username configured at<br/>[build time](howto/source.md#source-config-src)<br/>or at<br/>[startup](howto/source.md#source-startup).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **working_directory**  | String;<br/>the app’s working directory.<br/><br/>The default is<br/>the working directory<br/>of Unit’s<br/>[main process](howto/security.md#sec-processes).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Also, you need to set **type**-specific options
to run the app.
This
[Python app](#configuration-python)
sets **path** and **module**:

```json
{
    "type": "python 3.6",
    "processes": 16,
    "working_directory": "/www/python-apps",
    "path": "blog",
    "module": "blog.wsgi",
    "user": "blog",
    "group": "blog",
    "environment": {
        "DJANGO_SETTINGS_MODULE": "blog.settings.prod",
        "DB_ENGINE": "django.db.backends.postgresql",
        "DB_NAME": "blog",
        "DB_HOST": "127.0.0.1",
        "DB_PORT": "5432"
    }
}
```

<a id="configuration-proc-mgmt"></a>

### Process management

Unit has three per-app options
that control how the app’s processes behave:
**isolation**, **limits**, and **processes**.
Also, you can **GET**
the **/control/applications/** section of the API
to restart an app:

```bash
# curl -X GET --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>`  \
      http://localhost/control/applications/:nxt_ph:`app_name <Your application's name as defined in the /config/applications/ section>`/restart
```

Unit handles the rollover gracefully,
allowing the old processes
to deal with existing requests
and starting a new set of processes
(as defined by the **processes**
[option](#configuration-proc-mgmt-prcs))
to accept new requests.

<a id="configuration-proc-mgmt-isolation"></a>

#### Process isolation

You can use
[namespace](https://man7.org/linux/man-pages/man7/namespaces.7.html)
and
[file system](https://man7.org/linux/man-pages/man2/chroot.2.html)
isolation for your apps
if Unit’s underlying OS supports them:

```bash
$ ls /proc/self/ns/

    cgroup :nxt_hint:`mnt <The mount namespace>` :nxt_hint:`net <The network namespace>` pid ... :nxt_hint:`user <The credential namespace>` :nxt_hint:`uts <The uname namespace>`
```

The **isolation** application option
has the following members:

| Option         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **automount**  | Object;<br/>controls mount behavior<br/>if **rootfs** is enabled.<br/>By default, Unit automatically mounts the<br/>[language runtime dependencies](#conf-rootfs),<br/>a<br/>[procfs](https://man7.org/linux/man-pages/man5/procfs.5.html)<br/>at **/proc/**,<br/>and a<br/>[tmpfs](https://man7.org/linux/man-pages/man5/tmpfs.5.html) at **/tmp/**,<br/>but you can disable any of these default mounts:<br/><br/>```json<br/>{<br/>    "isolation": {<br/>        "automount": {<br/>            "language_deps": false,<br/>            "procfs": false,<br/>            "tmpfs": false<br/>        }<br/>    }<br/>}<br/>```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **cgroup**     | Object;<br/>defines the app’s<br/>[cgroup](#conf-app-cgroup).<br/><br/>| Option              | Description                                                                                                                                                                                                                                                                  |<br/>|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|<br/>| **path** (required) | String;<br/>configures absolute or relative path of the app<br/>in the<br/>[cgroups v2 hierarchy](https://man7.org/linux/man-pages/man7/cgroups.7.html#CGROUPS_VERSION_2).<br/>The limits trickle down the hierarchy,<br/>so child cgroups can’t exceed parental thresholds. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **gidmap**     | Same as **uidmap**,<br/>but configures group IDs instead of user IDs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **namespaces** | Object; configures<br/>[namespace](https://man7.org/linux/man-pages/man7/namespaces.7.html)<br/>isolation scheme for the application.<br/><br/>Available options<br/>(system-dependent;<br/>check your OS manual for guidance):<br/><br/>| **cgroup**     | Creates a new<br/>[cgroup](https://man7.org/linux/man-pages/man7/cgroup_namespaces.7.html)<br/>namespace for the app.   |<br/>|----------------|-------------------------------------------------------------------------------------------------------------------------|<br/>| **credential** | Creates a new<br/>[user](https://man7.org/linux/man-pages/man7/user_namespaces.7.html)<br/>namespace for the app.       |<br/>| **mount**      | Creates a new<br/>[mount](https://man7.org/linux/man-pages/man7/mount_namespaces.7.html)<br/>namespace for the app.     |<br/>| **network**    | Creates a new<br/>[network](https://man7.org/linux/man-pages/man7/network_namespaces.7.html)<br/>namespace for the app. |<br/>| **pid**        | Creates a new<br/>[PID](https://man7.org/linux/man-pages/man7/pid_namespaces.7.html)<br/>namespace for the app.         |<br/>| **uname**      | Creates a new<br/>[UTS](https://man7.org/linux/man-pages/man7/namespaces.7.html)<br/>namespace for the app.             |<br/><br/>All options listed above are Boolean;<br/>to isolate the app,<br/>set the corresponding namespace option to **true**;<br/>to disable isolation,<br/>set the option to **false**<br/>(default). |
| **rootfs**     | String; pathname of the directory<br/>to be used as the new<br/>[file system root](#conf-rootfs)<br/>for the app.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **uidmap**     | Array of user ID<br/>[mapping objects](#conf-uidgid-mapping);<br/>each array item must define the following:<br/><br/>| **container**   | Integer;<br/>starts the user ID mapping range<br/>in the app’s namespace.   |<br/>|-----------------|-----------------------------------------------------------------------------|<br/>| **host**        | Integer;<br/>starts the user ID mapping range<br/>in the OS namespace.      |<br/>| **size**        | Integer;<br/>size of the ID range<br/>in both namespaces.                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

A sample **isolation** object
that enables all namespaces
and sets mappings for user and group IDs:

```json
{
    "namespaces": {
        "cgroup": true,
        "credential": true,
        "mount": true,
        "network": true,
        "pid": true,
        "uname": true
    },

    "cgroup": {
        "path": "/unit/appcgroup"
    },

    "uidmap": [
        {
            "host": 1000,
            "container": 0,
            "size": 1000
        }
    ],

    "gidmap": [
        {
            "host": 1000,
            "container": 0,
            "size": 1000
        }
    ]
}
```

<a id="conf-app-cgroup"></a>

##### Using control groups

A control group (cgroup) commands
the use of computational resources
by a group of processes
in a unified hierarchy.
Cgroups are defined
by their *paths*
in the cgroups file system.

The **cgroup** object
defines the cgroup
for a Unit app;
its **path** option
can set an absolute
(starting with **/**)
or a relative value.
If the path doesn’t exist
in the cgroups file system,
Unit creates it.

Relative paths are implicitly placed
inside the cgroup of Unit’s
[main process](howto/security.md#sec-processes);
this setting effectively puts the app
to the **/<main Unit process cgroup>/production/app** cgroup:

```json
{
    "isolation": {
        "cgroup": {
            "path": "production/app"
        }
    }
}
```

An absolute pathname places the application
under a separate cgroup subtree;
this configuration puts the app under **/staging/app**:

```json
{
    "isolation": {
        "cgroup": {
            "path": "/staging/app"
        }
    }
}
```

A basic use case
would be to set a memory limit on a cgroup.
First,
find the cgroup mount point:

```bash
$ mount -l | grep cgroup

    cgroup2 on /sys/fs/cgroup type cgroup2 (rw,nosuid,nodev,noexec,relatime,nsdelegate,memory_recursiveprot)
```

Next, check the available controllers
and set the **memory.high** limit:

```bash
# cat /sys/fs/cgroup/:nxt_hint:`/staging/app <cgroup's path set in Unit configuration>`/cgroup.controllers

    cpuset cpu io memory pids

# echo 1G > /sys/fs/cgroup:nxt_hint:`/staging/app <cgroup's path set in Unit configuration>`/memory.high
```

For more details
and possible options,
refer to the
[admin guide](https://docs.kernel.org/admin-guide/cgroup-v2.html).

#### NOTE
To avoid confusion,
mind that the **namespaces/cgroups** option
controls the application’s cgroup *namespace*;
instead, the **cgroup/path** option
specifies the cgroup where Unit puts the application.

<a id="conf-rootfs"></a>

##### Changing root directory

The **rootfs** option confines the app
to the directory you provide,
making it the new
[file system root](https://man7.org/linux/man-pages/man2/chroot.2.html).
To use it,
your app should have the corresponding privilege
(effectively,
run as **root** in most cases).

The root directory is changed
before the language module starts the app,
so any path options for the app
should be relative to the new root.
Note the **path** and **home** settings:

```json
{
    "type": "python 2.7",
    "path": ":nxt_hint:`/ <Without rootfs, this would be /var/app/sandbox/>`",
    "home": ":nxt_hint:`/venv/ <Without rootfs, this would be /var/app/sandbox/venv/>`",
    "module": "wsgi",
    "isolation": {
        "rootfs": "/var/app/sandbox/"
    }
}
```

#### WARNING
When using **rootfs**
with **credential** set to **true**:

```json
"isolation": {
    "rootfs": "/var/app/sandbox/",
    "namespaces": {
        "credential": true
    }
}
```

Ensure that the user the app *runs as*
can access the **rootfs** directory.

Unit mounts language-specific files and directories
to the new root
so the app stays operational:

| Language   | Language-Specific Mounts                                                                                                                                                                                                                                                                                                                                                                   |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Java       | - JVM’s **libc.so** directory<br/>- Java module’s<br/>  [home](howto/source.md#modules-java)<br/>  directory                                                                                                                                                                                                                                                                               |
| Python     | Python’s **sys.path**<br/>[directories](https://docs.python.org/3/library/sys.html#sys.path)                                                                                                                                                                                                                                                                                               |
| Ruby       | - Ruby’s header, interpreter, and library<br/>  [directories](https://idiosyncratic-ruby.com/42-ruby-config.html):<br/>  **rubyarchhdrdir**,<br/>  **rubyhdrdir**,<br/>  **rubylibdir**,<br/>  **rubylibprefix**,<br/>  **sitedir**,<br/>  and **topdir**<br/>- Ruby’s gem installation directory<br/>  (**gem env gemdir**)<br/>- Ruby’s entire gem path list<br/>  (**gem env gempath**) |

The **uidmap** and **gidmap** options
are available only
if the underlying OS supports
[user namespaces](https://man7.org/linux/man-pages/man7/user_namespaces.7.html).

If **uidmap** is omitted but **credential** isolation is enabled,
the effective UID (EUID) of the application process
in the host namespace
is mapped to the same UID
in the container namespace;
the same applies to **gidmap** and GID, respectively.
This means that the configuration below:

```json
{
    "user": "some_user",
    "isolation": {
        "namespaces": {
            "credential": true
        }
    }
}
```

Is equivalent to the following
(assuming **some_user**’s EUID and EGID are both equal to 1000):

```json
{
    "user": "some_user",
    "isolation": {
        "namespaces": {
            "credential": true
        },

        "uidmap": [
            {
                "host": "1000",
                "container": "1000",
                "size": 1
            }
        ],

        "gidmap": [
            {
                "host": "1000",
                "container": "1000",
                "size": 1
            }
        ]
    }
}
```

<a id="configuration-proc-mgmt-lmts"></a>

#### Request limits

The **limits** object
controls request handling by the app process
and has two integer options:

| Option       | Description                                                                                                                                                                                                                                                                                                                           |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **requests** | Integer;<br/>maximum number of requests<br/>an app process can serve.<br/>When the limit is reached,<br/>the process restarts;<br/>this mitigates possible memory leaks<br/>or other cumulative issues.                                                                                                                               |
| **timeout**  | Integer;<br/>request timeout in seconds.<br/>If an app process exceeds it<br/>while handling a request,<br/>Unit cancels the request<br/>and returns a 503 “Service Unavailable” response<br/>to the client.<br/><br/>#### NOTE<br/>Now, Unit doesn’t detect freezes,<br/>so the hanging process stays on<br/>the app’s process pool. |

Example:

```json
{
    "type": "python",
    "working_directory": "/www/python-apps",
    "module": "blog.wsgi",
    "limits": {
        "timeout": 10,
        "requests": 1000
    }
}
```

<a id="configuration-proc-mgmt-prcs"></a>

#### Application processes

The **processes** option
offers a choice
between static and dynamic process management.
If you set it to an integer,
Unit immediately launches the given number of app processes
and keeps them without scaling.

To enable a dynamic prefork model for your app,
supply a **processes** object with the following options:

| Option           | Description                                                                                                                                                                                                                                                                                                                                                                                               |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **idle_timeout** | Number of seconds<br/>Unit waits for<br/>before terminating an idle process<br/>that exceeds **spare**.                                                                                                                                                                                                                                                                                                   |
| **max**          | Maximum number of application processes<br/>that Unit maintains<br/>(busy and idle).<br/><br/>The default is 1.                                                                                                                                                                                                                                                                                           |
| **spare**        | Minimum number of idle processes<br/>that Unit tries to maintain for an app.<br/>When the app is started,<br/>**spare** idles are launched;<br/>Unit passes new requests to existing idles,<br/>forking new idles<br/>to keep the **spare** level<br/>if **max** allows.<br/>When busy processes complete their work<br/>and turn idle again,<br/>Unit terminates extra idles<br/>after **idle_timeout**. |

If **processes** is omitted entirely,
Unit creates 1 static process.
If an empty object is provided: **“processes”: {}**,
dynamic behavior
with default option values
is assumed.

Here, Unit allows 10 processes maximum,
keeps 5 idles,
and terminates extra idles after 20 seconds:

```json
{
    "max": 10,
    "spare": 5,
    "idle_timeout": 20
}
```

#### NOTE
For details of manual application process restart, see
[here](#configuration-proc-mgmt).

<a id="configuration-languages"></a>

<a id="configuration-go"></a>

### Go

To run a Go app on Unit,
modify its source
to make it Unit-aware
and rebuild the app.

Unit uses
[cgo](https://pkg.go.dev/cmd/cgo)
to invoke C code from Go,
so check the following prerequisites:

- The `CGO_ENABLED` variable is set to **1**:
  ```bash
  $ go env CGO_ENABLED

        0

  $ go env -w CGO_ENABLED=1
  ```
- If you installed Unit from the
  [official packages](installation.md#installation-precomp-pkgs),
  install the development package:
  ```bash
  # apt install unit-dev
  ```

  ```bash
  # yum install unit-devel
  ```
- If you installed Unit from
  [source](howto/source.md),
  install the include files and libraries:
  ```bash
  # make libunit-install
  ```

In the **import** section,
list the **unit.nginx.org/go** package:

```go
import (
    ...
    "unit.nginx.org/go"
    ...
)
```

Replace the **http.ListenAndServe** call
with **unit.ListenAndServe**:

```go
func main() {
    ...
    http.HandleFunc("/", handler)
    ...
    // http.ListenAndServe(":8080", nil)
    unit.ListenAndServe(":8080", nil)
    ...
}
```

If you haven’t done so yet,
initialize the Go module for your app:

```bash
$ go mod init :nxt_ph:`example.com/app <Arbitrary module designation>`

      go: creating new go.mod: module example.com/app
```

Install the newly added dependency
and build your application:

```bash
$ go get unit.nginx.org/go@1.32.1

      go: downloading unit.nginx.org

$ go build -o :nxt_ph:`app <Executable name>` :nxt_ph:`app.go <Application source code>`
```

If you update Unit to a newer version,
repeat the two commands above
to rebuild your app.

The resulting executable works as follows:

- When you run it standalone,
  the **unit.ListenAndServe** call
  falls back to **http** functionality.
- When Unit runs it,
  **unit.ListenAndServe** directly communicates
  with Unit’s router process,
  ignoring the address supplied as its first argument
  and relying on the
  [listener’s settings](#configuration-listeners)
  instead.

Next, configure the app on Unit;
besides the
[common options](#configuration-apps-common),
you have:

| Option                    | Description                                                                                                                                                                        |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **executable** (required) | String;<br/>pathname of the application,<br/>absolute or relative to **working_directory**.                                                                                        |
| **arguments**             | Array of strings;<br/>command-line arguments<br/>to be passed to the application.<br/>The example below is equivalent to<br/>**/www/chat/bin/chat_app --tmp-files /tmp/go-cache**. |

Example:

```json
{
    "type": "external",
    "working_directory": "/www/chat",
    "executable": "bin/chat_app",
    "user": "www-go",
    "group": "www-go",
    "arguments": [
        "--tmp-files",
        "/tmp/go-cache"
    ]
}
```

#### NOTE
For Go-based examples,
see our
[Grafana](howto/grafana.md)
howto or a basic
[sample](howto/samples.md#sample-go).

<a id="configuration-java"></a>

### Java

First, make sure to install Unit
along with the
[Java language module](installation.md#installation-precomp-pkgs).

Besides the
[common options](#configuration-apps-common),
you have:

| Option                | Description                                                                                                                                                                                                                                                                                                |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **webapp** (required) | String;<br/>pathname<br/>of the application’s **.war** file<br/>(packaged or unpackaged).                                                                                                                                                                                                                  |
| **classpath**         | Array of strings;<br/>paths to your app’s required libraries<br/>(may point to directories<br/>or individual **.jar** files).                                                                                                                                                                              |
| **options**           | Array of strings;<br/>defines JVM runtime options.<br/><br/>Unit itself<br/>exposes the **-Dnginx.unit.context.path** option<br/>that defaults to **/**;<br/>use it to customize the<br/>[context path](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletContext.html#getContextPath--). |
| **thread_stack_size** | Integer;<br/>stack size of a worker thread<br/>(in bytes,<br/>multiple of memory page size;<br/>the minimum value is usually architecture specific).<br/><br/>The default is usually system dependent<br/>and can be set with **ulimit -s <SIZE_KB>**.                                                     |
| **threads**           | Integer;<br/>number of worker threads<br/>per [app process](howto/security.md#sec-processes).<br/>When started,<br/>each app process creates this number of threads<br/>to handle requests.<br/><br/>The default is **1**.                                                                                 |

Example:

```json
{
    "type": "java",
    "classpath": [
        "/www/qwk2mart/lib/qwk2mart-2.0.0.jar"
    ],

    "options": [
        "-Dlog_path=/var/log/qwk2mart.log"
    ],

    "webapp": "/www/qwk2mart/qwk2mart.war"
}
```

#### NOTE
For Java-based examples,
see our
[Jira](howto/jira.md),
[OpenGrok](howto/opengrok.md),
and
[Spring Boot](howto/springboot.md)
howtos or a basic
[sample](howto/samples.md#sample-java).

<a id="configuration-nodejs"></a>

### Node.js

First, you need to have the **unit-http** module
[installed](installation.md#installation-nodejs-package).
If it’s global,
symlink it in your project directory:

```bash
# npm link unit-http
```

Do the same if you move a Unit-hosted app
to a new system
where **unit-http** is installed globally.
Also, if you update Unit later,
update the Node.js module as well
according to your
[installation method](installation.md#installation-nodejs-package).

Next, to run your Node.js apps on Unit,
you need to configure them.
Besides the
[common options](#configuration-apps-common),
you have:

| Option                    | Description                                                                                                                                                                                                                                                                                                                                          |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **executable** (required) | String;<br/>pathname of the app,<br/>absolute or relative to **working_directory**.<br/><br/>Supply your **.js** pathname here<br/>and start the file itself<br/>with a proper shebang:<br/><br/>```javascript<br/>#!/usr/bin/env node<br/>```<br/><br/>#### NOTE<br/>Make sure to **chmod +x**<br/>the file you list here<br/>so Unit can start it. |
| **arguments**             | Array of strings;<br/>command-line arguments<br/>to be passed to the app.<br/>The example below is equivalent to<br/>**/www/apps/node-app/app.js --tmp-files /tmp/node-cache**.                                                                                                                                                                      |

Example:

```json
{
    "type": "external",
    "working_directory": "/www/app/node-app/",
    "executable": "app.js",
    "user": "www-node",
    "group": "www-node",
    "arguments": [
        "--tmp-files",
        "/tmp/node-cache"
    ]
}
```

<a id="configuration-nodejs-loader"></a>

You can run Node.js apps without altering their code,
using a loader module
we provide with **unit-http**.
Apply the following app configuration,
depending on your version of Node.js:

```json
{
    "type": "external",
    "executable": ":nxt_hint:`/usr/bin/env <The external app type allows to run arbitrary executables, provided they establish communication with Unit>`",
    "arguments": [
        "node",
        "--loader",
        "unit-http/loader.mjs",
        "--require",
        "unit-http/loader",
        ":nxt_ph:`app.js <Application script name>`"
    ]
}
```

```json
{
    "type": "external",
    "executable": ":nxt_hint:`/usr/bin/env <The external app type allows to run arbitrary executables, provided they establish communication with Unit>`",
    "arguments": [
        "node",
        "--require",
        "unit-http/loader",
        ":nxt_ph:`app.js <Application script name>`"
    ]
}
```

The loader overrides the **http** and **websocket** modules
with their Unit-aware versions
and starts the app.

You can also run your Node.js apps without the loader
by updating the application source code.
For that, use **unit-http** instead of **http** in your code:

```javascript
var http = require('unit-http');
```

To use the WebSocket protocol,
your app only needs to replace the default **websocket**:

```javascript
var webSocketServer = require('unit-http/websocket').server;
```

#### NOTE
For Node.js-based examples,
see our
[Apollo](howto/apollo.md),
[Express](howto/express.md),
[Koa](howto/koa.md),
and
[Docker](howto/docker.md#docker-apps)
howtos or a basic
[sample](howto/samples.md#sample-nodejs).

<a id="configuration-perl"></a>

### Perl

First, make sure to install Unit along with the
[Perl language module](installation.md#installation-precomp-pkgs).

Besides the
[common options](#configuration-apps-common),
you have:

| Option                | Description                                                                                                                                                                                                                                            |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **script** (required) | String;<br/>PSGI script path.                                                                                                                                                                                                                          |
| **thread_stack_size** | Integer;<br/>stack size of a worker thread<br/>(in bytes,<br/>multiple of memory page size;<br/>the minimum value is usually architecture specific).<br/><br/>The default is usually system dependent<br/>and can be set with **ulimit -s <SIZE_KB>**. |
| **threads**           | Integer;<br/>number of worker threads<br/>per [app process](howto/security.md#sec-processes).<br/>When started,<br/>each app process creates this number of threads<br/>to handle requests.<br/><br/>The default is **1**.                             |

Example:

```json
{
    "type": "perl",
    "script": "/www/bugtracker/app.psgi",
    "working_directory": "/www/bugtracker",
    "processes": 10,
    "user": "www",
    "group": "www"
}
```

#### NOTE
For Perl-based examples of Perl,
see our
[Bugzilla](howto/bugzilla.md)
and
[Catalyst](howto/catalyst.md)
howtos or a basic
[sample](howto/samples.md#sample-perl).

<a id="configuration-php"></a>

### PHP

First, make sure to install Unit along with the
[PHP language module](installation.md#installation-precomp-pkgs).

Besides the
[common options](#configuration-apps-common), you have:

| Option              | Description                                                                                                                               |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **root** (required) | String;<br/>base directory<br/>of the app’s file structure.<br/>All URI paths are relative to it.                                         |
| **index**           | String;<br/>filename added to URI paths<br/>that point to directories<br/>if no **script** is set.<br/><br/>The default is **index.php**. |
| **options**         | Object;<br/>[defines](#configuration-php-options)<br/>the **php.ini** location and options.                                               |
| **script**          | String;<br/>filename of a **root**-based PHP script<br/>that serves all requests to the app.                                              |
| **targets**         | Object;<br/>defines application sections with<br/>[custom](#configuration-php-targets)<br/>**root**, **script**, and **index** values.    |

The **index** and **script** options
enable two modes of operation:

- If **script** is set,
  all requests to the application are handled
  by the script you specify in this option.
- Otherwise, the requests are served
  according to their URI paths;
  if they point to directories,
  **index** is used.

<a id="configuration-php-options"></a>

You can customize **php.ini**
via the **options** object:

| Option              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **admin**, **user** | Objects for extra directives.<br/>Values in **admin** are set in **PHP_INI_SYSTEM** mode,<br/>so the app can’t alter them;<br/>**user** values are set in **PHP_INI_USER** mode<br/>and can be<br/>[updated](https://www.php.net/manual/en/function.ini-set.php)<br/>at runtime.<br/><br/>- The objects override the settings<br/>  from any **\*.ini** files<br/>- The **admin** object can only set what’s<br/>  [listed](https://www.php.net/manual/en/ini.list.php)<br/>  as **PHP_INI_SYSTEM**;<br/>  for other modes,<br/>  set **user**<br/>- Neither **admin** nor **user**<br/>  can set directives listed as<br/>  [php.ini only](https://www.php.net/manual/en/ini.list.php)<br/>  except for **disable_classes** and **disable_functions** |
| **file**            | String;<br/>pathname of the **php.ini** file with<br/>[PHP configuration directives](https://www.php.net/manual/en/ini.list.php).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

To load multiple **.ini** files,
use **environment** with `PHP_INI_SCAN_DIR` to
[scan a custom directory](https://www.php.net/manual/en/configuration.file.php):

```json
{
    "applications": {
        "hello-world": {
            "type": "php",
            "root": "/www/public/",
            "script": "index.php",
            "environment": {
                "PHP_INI_SCAN_DIR": ":nxt_ph:`: <Path separator>`/tmp/php.inis/"
            }
        }
    }
}
```

Mind that the colon that prefixes the value here is a path separator;
it causes PHP to scan the directory preconfigured with the
`--with-config-file-scan-dir` option,
which is usually **/etc/php.d/**,
and then the directory you set here, which is **/tmp/php.inis/**.
To skip the preconfigured directory, drop the **:** prefix.

#### NOTE
Values in **options** must be strings
(for example, **“max_file_uploads”: “4”**,
not **“max_file_uploads”: 4**);
for boolean flags,
use **“0”** and **“1”** only.
For details aof **PHP_INI_\*** modes,
see the
[PHP docs](https://www.php.net/manual/en/configuration.changes.modes.php).

#### NOTE
Unit implements the **fastcgi_finish_request()** [function](https://www.php.net/manual/en/function.fastcgi-finish-request.php) in a
manner similar to PHP-FPM.

Example:

```json
{
    "type": "php",
    "processes": 20,
    "root": "/www/blogs/scripts/",
    "user": "www-blogs",
    "group": "www-blogs",
    "options": {
        "file": "/etc/php.ini",
        "admin": {
            "memory_limit": "256M",
            "variables_order": "EGPCS"
        },

        "user": {
            "display_errors": "0"
        }
    }
}
```

<a id="configuration-php-targets"></a>

#### Targets

You can configure up to 254 individual entry points
for a single PHP app:

```json
{
    "applications": {
        "php-app": {
            "type": "php",
            "targets": {
                "front": {
                    "script": "front.php",
                    "root": "/www/apps/php-app/front/"
                },

                "back": {
                    "script": "back.php",
                    "root": "/www/apps/php-app/back/"
                }
            }
        }
    }
}
```

Each target is an object
that specifies **root**
and can define **index** or **script**
just like a regular app does.
Targets can be used by the **pass** options
in listeners and routes
to serve requests:

```json
{
    "listeners": {
        "127.0.0.1:8080": {
            "pass": "applications/php-app/front"
        },

        "127.0.0.1:80": {
            "pass": "routes"
        }
    },

    "routes": [
        {
            "match": {
                "uri": "/back"
            },

            "action": {
                "pass": "applications/php-app/back"
            }
        }
    ]
}
```

App-wide settings
(**isolation**, **limits**, **options**, **processes**)
are shared by all targets within the app.

#### WARNING
If you specify **targets**,
there should be no **root**, **index**, or **script**
defined at the app level.

#### NOTE
For PHP-based examples,
see our
[CakePHP](howto/cakephp.md),
[CodeIgniter](howto/codeigniter.md),
[DokuWiki](howto/dokuwiki.md),
[Drupal](howto/drupal.md),
[Laravel](howto/laravel.md),
[Lumen](howto/lumen.md),
[Matomo](howto/matomo.md),
[MediaWiki](howto/mediawiki.md),
[MODX](howto/modx.md),
[NextCloud](howto/nextcloud.md),
[phpBB](howto/phpbb.md),
[phpMyAdmin](howto/phpmyadmin.md),
[Roundcube](howto/roundcube.md),
[Symfony](howto/symfony.md),
[WordPress](howto/wordpress.md),
and
[Yii](howto/yii.md)
howtos or a basic
[sample](howto/samples.md#sample-php).

<a id="configuration-python"></a>

### Python

First, make sure to install Unit along with the
[Python language module](installation.md#installation-precomp-pkgs).

Besides the
[common options](#configuration-apps-common),
you have:

| Option                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **module** (required) | String;<br/>app’s module name.<br/>This module is<br/>[imported](https://docs.python.org/3/reference/import.html)<br/>by Unit<br/>the usual Python way.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **callable**          | String;<br/>name of the **module**-based callable<br/>that Unit runs as the app.<br/><br/>The default is **application**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **home**              | String;<br/>path to the app’s<br/>[virtual environment](https://packaging.python.org/en/latest/tutorials/installing-packages/#creating-virtual-environments).<br/>Absolute or relative to **working_directory**.<br/><br/>#### NOTE<br/>The Python version used to run the app<br/>is determined by **type**;<br/>for performance,<br/>Unit doesn’t use the command-line interpreter<br/>from the virtual environment.<br/><br/>Seeing this in Unit’s<br/>[log](troubleshooting.md#troubleshooting-log)<br/>after you set up **home** for your app?<br/>This usually occurs<br/>if the interpreter can’t use the virtual environment,<br/>possible reasons including:<br/><br/>- Version mismatch<br/>  between the **type** setting<br/>  and the virtual environment;<br/>  check the environment’s version:<br/>  ```bash<br/>  $ source :nxt_ph:`/path/to/venv/ <Path to the virtual environment; use a real path in your commands>`bin/activate<br/>  (venv) $ python --version<br/>  ```<br/>- Unit’s unprivileged user<br/>  (usually **unit**)<br/>  having no access to the environment’s files;<br/>  assign the necessary rights:<br/>  ```bash<br/>  # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/venv/ <Path to the virtual environment; use a real path in your commands>`<br/>  ``` |
| **path**              | String or an array of strings;<br/>additional Python module lookup paths.<br/>These values are prepended to **sys.path**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **prefix**            | String;<br/>**SCRIPT_NAME** context value for WSGI<br/>or the **root_path** context value for ASGI.<br/>Should start with a slash<br/>(**/**).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **protocol**          | String;<br/>hints Unit that the app uses a certain interface.<br/>Can be **asgi** or **wsgi**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **targets**           | Object;<br/>app sections with<br/>[custom](#configuration-python-targets)<br/>**module** and **callable** values.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **thread_stack_size** | Integer;<br/>stack size of a worker thread<br/>(in bytes,<br/>multiple of memory page size;<br/>the minimum value is usually architecture specific).<br/><br/>The default is usually system dependent<br/>and can be set with **ulimit -s <SIZE_KB>**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **threads**           | Integer;<br/>number of worker threads<br/>per [app process](howto/security.md#sec-processes).<br/>When started,<br/>each app process creates this number of threads<br/>to handle requests.<br/><br/>The default is **1**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

Example:

```json
{
    "type": "python",
    "processes": 10,
    "working_directory": "/www/store/cart/",
    "path": ":nxt_hint:`/www/store/ <Added to sys.path for lookup; store the application module within this directory>`",
    "home": ":nxt_hint:`.virtualenv/ <Path where the virtual environment is located; here, it's relative to the working directory>`",
    "module": ":nxt_hint:`cart.run <Looks for a 'run.py' module in /www/store/cart/>`",
    "callable": "app",
    "prefix": ":nxt_hint:`/cart <Sets the SCRIPT_NAME or root_path context value>`",
    "user": "www",
    "group": "www"
}
```

This snippet runs the **app** callable
from the **/www/store/cart/run.py** module
with **/www/store/cart/** as the working directory
and **/www/store/.virtualenv/** as the virtual environment;
the **path** value
accommodates for situations
when some modules of the app
are imported
from outside the **cart/** subdirectory.

<a id="configuration-python-asgi"></a>

You can provide the callable in two forms.
The first one uses WSGI
([PEP 333](https://peps.python.org/pep-0333/)
or [PEP 3333](https://peps.python.org/pep-3333/)):

```python
def application(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    yield b'Hello, WSGI\n'
```

The second one,
supported with Python 3.5+,
uses
[ASGI](https://asgi.readthedocs.io/en/latest/):

```python
async def application(scope, receive, send):

    await send({
        'type': 'http.response.start',
        'status': 200
    })

    await send({
        'type': 'http.response.body',
        'body': b'Hello, ASGI\n'
    })
```

#### NOTE
Legacy
[two-callable](https://asgi.readthedocs.io/en/latest/specs/main.html#legacy-applications)
ASGI 2.0 applications
were not supported prior to Unit 1.21.0.

Choose either one according to your needs;
Unit tries to infer your choice automatically.
If this inference fails,
use the **protocol** option
to set the interface explicitly.

#### NOTE
The **prefix** option
controls the **SCRIPT_NAME**
([WSGI](https://wsgi.readthedocs.io/en/latest/definitions.html))
or **root_path**
([ASGI](https://asgi.readthedocs.io/en/latest/specs/www.html#http-connection-scope))
setting in Python’s context,
allowing to route requests
regardless of the app’s factual path.

<a id="configuration-python-targets"></a>

#### Targets

You can configure up to 254 individual entry points
for a single Python app:

```json
{
    "applications": {
        "python-app": {
            "type": "python",
            "path": "/www/apps/python-app/",
            "targets": {
                "front": {
                    "module": "front.wsgi",
                    "callable": "app"
                },

                "back": {
                    "module": "back.wsgi",
                    "callable": "app"
                }
            }
        }
    }
}
```

Each target is an object
that specifies **module**
and can also define **callable** and **prefix**
just like a regular app does.
Targets can be used by the **pass** options
in listeners and routes
to serve requests:

```json
{
    "listeners": {
        "127.0.0.1:8080": {
            "pass": "applications/python-app/front"
        },

        "127.0.0.1:80": {
            "pass": "routes"
        }
    },

    "routes": [
        {
            "match": {
                "uri": "/back"
            },

            "action": {
                "pass": "applications/python-app/back"
            }
        }
    ]
}
```

The **home**, **path**, **protocol**, **threads**, and
**thread_stack_size** settings
are shared by all targets in the app.

#### WARNING
If you specify **targets**,
there should be no **module** or **callable**
defined at the app level.
Moreover, you can’t combine WSGI and ASGI targets
within a single app.

#### NOTE
For Python-based examples,
see our
[Bottle](howto/bottle.md),
[Datasette](howto/datasette.md),
[Django](howto/django.md),
[Django Channels](howto/djangochannels.md),
[Falcon](howto/falcon.md),
[FastAPI](howto/fastapi.md),
[Flask](howto/flask.md),
[Guillotina](howto/guillotina.md),
[Mailman Web](howto/mailman.md),
[Mercurial](howto/mercurial.md),
[MoinMoin](howto/moin.md),
[Plone](howto/plone.md),
[Pyramid](howto/pyramid.md),
[Quart](howto/quart.md),
[Responder](howto/responder.md),
[Review Board](howto/reviewboard.md),
[Sanic](howto/sanic.md),
[Starlette](howto/starlette.md),
[Trac](howto/trac.md),
and
[Zope](howto/zope.md)
howtos or a basic
[sample](howto/samples.md#sample-python).

<a id="configuration-ruby"></a>

### Ruby

First, make sure to install Unit along with the
[Ruby language module](installation.md#installation-precomp-pkgs).

#### NOTE
Unit uses the
[Rack](https://rack.github.io)
interface
to run Ruby scripts;
you need to have it installed as well:

```bash
$ gem install rack
```

Besides the
[common options](#configuration-apps-common),
you have:

| Option                | Description                                                                                                                                                                                           |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **script** (required) | String; rack script pathname, including the **.ru** extension,<br/>for instance: **/www/rubyapp/script.ru**.                                                                                          |
| **hooks**             | String; pathname of the **.rb** file setting the event hooks invoked<br/>during the app’s lifecycle.                                                                                                  |
| **threads**           | Integer; number of worker threads per<br/>[app process](howto/security.md#sec-processes). When started, each app process<br/>creates this number of threads to handle requests. The default is **1**. |

Example:

```json
{
   "type": "ruby",
   "processes": 5,
   "user": "www",
   "group": "www",
   "script": "/www/cms/config.ru",
   "hooks": "hooks.rb"
}
```

The **hooks** script
is evaluated when the app starts.
If set, it can define blocks of Ruby code named
**on_worker_boot**,
**on_worker_shutdown**,
**on_thread_boot**,
or **on_thread_shutdown**.
If provided,
these blocks are called
at the respective points
of the app’s lifecycle,
for example:

```ruby
@mutex = Mutex.new

File.write("./hooks.#{Process.pid}", "hooks evaluated")
# Runs once at app load.

on_worker_boot do
   File.write("./worker_boot.#{Process.pid}", "worker boot")
end
# Runs at worker process boot.

on_thread_boot do
   @mutex.synchronize do
      # Avoids a race condition that may crash the app.
      File.write("./thread_boot.#{Process.pid}.#{Thread.current.object_id}",
                  "thread boot")
   end
end
# Runs at worker thread boot.

on_thread_shutdown do
    @mutex.synchronize do
        # Avoids a race condition that may crash the app.
        File.write("./thread_shutdown.#{Process.pid}.#{Thread.current.object_id}",
                   "thread shutdown")
    end
end
# Runs at worker thread shutdown.

on_worker_shutdown do
    File.write("./worker_shutdown.#{Process.pid}", "worker shutdown")
end
# Runs at worker process shutdown.
```

Use these hooks
to add custom runtime logic
to your app.

#### NOTE
For Ruby-based examples,
see our
[Ruby on Rails](howto/rails.md)
and
[Redmine](howto/redmine.md)
howtos or a basic
[sample](howto/samples.md#sample-ruby).

<a id="configuration-wasm"></a>

### WebAssembly

First, make sure to install Unit along with the
[WebAssembly language module](installation.md#installation-precomp-pkgs).

Besides the
[common options](#configuration-apps-common),
you have:

| Option                   | Description                                                                                                                                                                                                                        |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **component** (required) | String; WebAssembly component pathname, including the **.wasm**<br/>extension, for instance: “/var/www/wasm/component.wasm”                                                                                                        |
| **access**               | Object;  its only array member, **filesystem**, lists<br/>directories to which the application has access:<br/><br/>```json<br/>"access": {<br/>   "filesystem": [<br/>      "/tmp/",<br/>      "/var/tmp/"<br/>   ]<br/>}<br/>``` |

Example:

```json
{
  "listeners": {
     "127.0.0.1:8080": {
        "pass": "applications/wasm"
     }
  },
  "applications": {
     "wasm": {
        "type": "wasm-wasi-component",
        "component": "/var/www/app/component.wasm",
        "access": {
        "filesystem": [
           "/tmp/",
           "/var/tmp/"
        ]
        }
     }
  }
}
```

#### NOTE
A good, first Rust-based project is available at
[sunfishcode/hello-wasi-http](https://github.com/sunfishcode/hello-wasi-http).
It also includes all the important steps to get started with WebAssembly, WASI, and Rust.

#### WARNING
The unit-wasm module is deprecated.
We recommend using wasm-wasi-component instead, which supports
WebAssembly Components using standard WASI 0.2 interfaces.
The wasm-wasi-component module is available in Unit 1.32 and later.

First, make sure to install Unit along with the
[WebAssembly language module](installation.md#installation-precomp-pkgs).

Besides the
[common options](#configuration-apps-common),
you have:

| Option                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **module** (required)          | String; WebAssembly module pathname, including the **.wasm** extension,<br/>for instance: **applications/wasmapp/module.wasm**.                                                                                                                                                                                                                                                                                                                                                                              |
| **request_handler** (required) | String; name of the request handler function. If you use Unit<br/>with the official **unit-wasm** [package](installation.md#installation-precomp-pkgs),<br/>the value is language specific; see the<br/>[SDK](https://github.com/nginx/unit-wasm/) documentation for details.<br/>Otherwise, use the name of your custom implementation.<br/><br/>The runtime calls this handler, providing the address of the<br/>shared memory block used to pass data in and out the app.                                 |
| **malloc_handler** (required)  | String; name of the memory allocator function.  See note above regarding<br/>language-specific handlers in the official unit-wasm package.<br/><br/>The runtime calls this handler at language module startup to allocate<br/>the shared memory block used to pass data in and out the app.                                                                                                                                                                                                                  |
| **free_handler** (required)    | String;  name of the memory deallocator function.  See note above regarding<br/>language-specific handlers in the official unit-wasm package.<br/><br/>The runtime calls this handler at language module shutdown to free<br/>the shared memory block used to pass data in and out the app.                                                                                                                                                                                                                  |
| **access**                     | Object;  its only array member, **filesystem**, lists directories<br/>the application can access:<br/><br/>```json<br/>"access": {<br/>   "filesystem": [<br/>      "/tmp/",<br/>      "/var/tmp/"<br/>   ]<br/>}<br/>```                                                                                                                                                                                                                                                                                    |
| **module_init_handler**,       | String;<br/>name of the module initilization function.<br/>If you use Unit with the official **unit-wasm**<br/>[package](installation.md#installation-precomp-pkgs),<br/>the value is language specific;<br/>see the [SDK](https://github.com/nginx/unit-wasm/)<br/>documentation for details.<br/>Otherwise, use the name of your custom implementation.<br/><br/>It is invoked by the WebAssembly language module<br/>at language module startup,<br/>after the WebAssembly module was initialized.        |
| **module_end_handler**         | String;<br/>name of the module finalization function.<br/>If you use Unit with the official **unit-wasm**<br/>[package](installation.md#installation-precomp-pkgs),<br/>the value is language specific;<br/>see the [SDK](https://github.com/nginx/unit-wasm/)<br/>documentation for details.<br/>Otherwise, use the name of your custom implementation.<br/><br/>It is invoked by the WebAssembly language module<br/>at language module shutdown.                                                          |
| **request_init_handler**       | String;<br/>name of the request initialization function.<br/>If you use Unit with the official **unit-wasm**<br/>[package](installation.md#installation-precomp-pkgs),<br/>the value is language specific;<br/>see the [SDK](https://github.com/nginx/unit-wasm/)<br/>documentation for details.<br/>Otherwise, use the name of your custom implementation.<br/><br/>It is invoked by the WebAssembly language module<br/>at the start of each request.                                                      |
| **request_end_handler**        | String;<br/>name of the request finalization function.<br/>If you use Unit with the official **unit-wasm**<br/>[package](installation.md#installation-precomp-pkgs),<br/>the value is language specific;<br/>see the [SDK](https://github.com/nginx/unit-wasm/)<br/>documentation for details.<br/>Otherwise, use the name of your custom implementation.<br/><br/>It is invoked by the WebAssembly language module<br/>at the end of each request,<br/>when the headers and the request body were received. |
| **response_end_handler**       | String;<br/>name of the response finalization function.<br/>If you use Unit with the official **unit-wasm**<br/>[package](installation.md#installation-precomp-pkgs),<br/>the value is language specific;<br/>see the [SDK](https://github.com/nginx/unit-wasm/)<br/>documentation for details.<br/>Otherwise, use the name of your custom implementation.<br/><br/>It is invoked by the WebAssembly language module<br/>at the end of each response,<br/>when the headers and the response body were sent.  |

Example:

```json
{
    "type": "wasm",
    "module": "/www/webassembly/unitapp.wasm",
    "request_handler": "my_custom_request_handler",
    "malloc_handler": "my_custom_malloc_handler",
    "free_handler": "my_custom_free_handler",
    "access": {
        "filesystem": [
            "/tmp/",
            "/var/tmp/"
        ]
    },
    "module_init_handler": "my_custom_module_init_handler",
    "module_end_handler": "my_custom_module_end_handler",
    "request_init_handler": "my_custom_request_init_handler",
    "request_end_handler": "my_custom_request_end_handler",
    "response_end_handler": "my_custom_response_end_handler"
}
```

Use these handlers to add custom runtime logic to your app; for a detailed
discussion of their usage and requirements, see the
[SDK](https://github.com/nginx/unit-wasm/) source code and documentation.

#### NOTE
For WASM-based examples, see our [Rust and C samples](howto/samples.md#sample-wasm).

<a id="configuration-stngs"></a>

## Settings

Unit has a global **settings** configuration object
that stores instance-wide preferences.

| Option        | Description                                                                                                                                      |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **http**      | Object;<br/>fine-tunes handling of HTTP requests<br/>from the clients.                                                                           |
| **js_module** | String or an array of strings;<br/>lists enabled<br/>**njs**<br/>[modules](scripting.md),<br/>uploaded<br/>via the [control API](controlapi.md). |

In turn, the **http** option exposes the following settings:

| Option                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **body_read_timeout**     | Maximum number of seconds<br/>to read data from the body<br/>of a client’s request.<br/>This is the interval<br/>between consecutive read operations,<br/>not the time to read the entire body.<br/>If Unit doesn’t receive any data<br/>from the client<br/>within this interval,<br/>it returns a 408 “Request Timeout” response.<br/><br/>The default is 30.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **discard_unsafe_fields** | Boolean;<br/>controls header field name parsing.<br/>If it’s set to **true**,<br/>Unit only processes header names<br/>made of alphanumeric characters and hyphens<br/>(see<br/>[RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110#section-16.3.1-6));<br/>otherwise,<br/>these characters are also permitted:<br/>**.!#$%&’\*+^_\`|~**.<br/><br/>The default is **true**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **header_read_timeout**   | Maximum number of seconds<br/>to read the header<br/>of a client’s request.<br/>If Unit doesn’t receive the entire header<br/>from the client<br/>within this interval,<br/>it returns a 408 “Request Timeout” response.<br/><br/>The default is 30.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **idle_timeout**          | Maximum number of seconds<br/>between requests<br/>in a keep-alive connection.<br/>If no new requests<br/>arrive within this interval,<br/>Unit returns a 408 “Request Timeout” response<br/>and closes the connection.<br/><br/>The default is 180.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **log_route**             | Boolean;<br/>enables or disables<br/>[router logging](troubleshooting.md#troubleshooting-router-log).<br/><br/>The default is **false** (disabled).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **max_body_size**         | Maximum number of bytes<br/>in the body of a client’s request.<br/>If the body size exceeds this value,<br/>Unit returns a 413 “Payload Too Large” response<br/>and closes the connection.<br/><br/>The default is 8388608 (8 MB).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **send_timeout**          | Maximum number of seconds<br/>to transmit data<br/>as a response to the client.<br/>This is the interval<br/>between consecutive transmissions,<br/>not the time for the entire response.<br/>If no data<br/>is sent to the client<br/>within this interval,<br/>Unit closes the connection.<br/><br/>The default is 30.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **server_version**        | Boolean;<br/>if set to **false**,<br/>Unit omits version information<br/>in its **Server** response<br/>[header fields](https://datatracker.ietf.org/doc/html/rfc9110.html#section-10.2.4).<br/><br/>The default is **true**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **static**                | Object;<br/>configures static asset handling.<br/>Has a single object option named **mime_types**<br/>that defines specific<br/>[MIME types](https://www.iana.org/assignments/media-types/media-types.xhtml)<br/>as options.<br/>Their values<br/>can be strings or arrays of strings;<br/>each string must specify a filename extension<br/>or a specific filename<br/>that’s included in the MIME type.<br/>You can override default MIME types<br/>or add new types:<br/><br/>```bash<br/># curl -X PUT -d '{"text/x-code": [".c", ".h"]}' :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` \<br/>       http://localhost/config/settings/http/static/mime_types<br/>{<br/>       "success": "Reconfiguration done."<br/>}<br/>```<br/><br/><a id="configuration-mime"></a><br/><br/>Defaults:<br/>**.aac**, **.apng**, **.atom**,<br/>**.avi**, **.avif**, **avifs**, **.bin**, **.css**,<br/>**.deb**, **.dll**, **.exe**, **.flac**, **.gif**,<br/>**.htm**, **.html**, **.ico**, **.img**, **.iso**,<br/>**.jpeg**, **.jpg**, **.js**, **.json**, **.md**,<br/>**.mid**, **.midi**, **.mp3**, **.mp4**, **.mpeg**,<br/>**.mpg**, **.msi**, **.ogg**, **.otf**, **.pdf**,<br/>**.php**, **.png**, **.rpm**, **.rss**, **.rst**,<br/>**.svg**, **.ttf**, **.txt**, **.wav**, **.webm**,<br/>**.webp**, **.woff2**, **.woff**, **.xml**, and<br/>**.zip**. |

<a id="configuration-access-log"></a>

## Access log

To enable basic access logging,
specify the log file path
in the **access_log** option
of the **config** object.

In the example below,
all requests will be logged
to **/var/log/access.log**:

```bash
# curl -X PUT -d '"/var/log/access.log"' \
       --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` \
       http://localhost/config/access_log

    {
        "success": "Reconfiguration done."
    }
```

By default, the log is written in the
[Combined Log Format](https://httpd.apache.org/docs/2.2/logs.html#combined).
Example of a CLF line:

```none
127.0.0.1 - - [21/Oct/2015:16:29:00 -0700] "GET / HTTP/1.1" 200 6022 "http://example.com/links.html" "Godzilla/5.0 (X11; Minix i286) Firefox/42"
```

### Custom log formatting

<a id="custom-log-format"></a>

The **access_log** option
can be also set to an object
to customize both the log path
and its format:

| Option     | Description                                                                                                                                   |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| **format** | String;<br/>sets the log format.<br/>Besides arbitrary text,<br/>can contain any<br/>[variables](#configuration-variables)<br/>Unit supports. |
| **path**   | String;<br/>pathname of the access log file.                                                                                                  |

Example:

```json
{
    "access_log": {
        "path": "/var/log/unit/access.log",
        "format": "$remote_addr - - [$time_local] \"$request_line\" $status $body_bytes_sent \"$header_referer\" \"$header_user_agent\""
    }
}
```

By a neat coincidence,
the above **format**
is the default setting.
Also, mind that the log entry
is formed *after* the request has been handled.

Besides
[built-in variables](#configuration-variables-native),
you can use **njs**
[templates](scripting.md)
to define the log format:

```json
{
    "access_log": {
        "path": "/var/log/unit/basic_access.log",
        "format": "`${host + ': ' + uri}`"
    }
}
```

### Conditional access log

<a id="id2"></a>

The **access_log** can be dynamically turned on and off by using the **if** option:

| Option   | Description                                                                             |
|----------|-----------------------------------------------------------------------------------------|
| **if**   | if the value is empty, 0, false, null, or undefined,<br/>the logs will not be recorded. |

This feature lets users set conditions to determine whether access logs are
recorded. The **if** option supports a string and JavaScript code.
If its value is empty, 0, false, null, or undefined, the logs will not be
recorded. And the ‘!’ as a prefix inverses the condition.

Example without NJS:

```json
{
   "access_log": {
      "if": "$cookie_session",
      "path": "..."
   }
}
```

All requests using a session cookie named **session** will be logged.

We can add ! to inverse the condition.

```json
{
   "access_log": {
      "if": "!$cookie_session",
      "path": "..."
   }
}
```

Now, all requests without a session cookie will be logged.

Example with NJS and the use of a template literal:

```json
{
   "access_log": {
      "if": "`${uri == '/health' ? false : true}`",
      "path": "..."
   }
}
```
