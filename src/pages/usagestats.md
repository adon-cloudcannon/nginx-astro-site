---
layout: ../layouts/BaseLayout.astro
title: Usage statistics
---
<a id="configuration-stats"></a>

# Usage statistics

Unit collects instance- and app-wide metrics,
available via the **GET**-only **/status** section of the
[control API](controlapi.md#configuration-api):

| Option           | Description                                                                |
|------------------|----------------------------------------------------------------------------|
| **connections**  | Object;<br/>lists per-instance connection statistics.                      |
| **requests**     | Object;<br/>lists per-instance request statistics.                         |
| **applications** | Object;<br/>each option item lists per-app process and request statistics. |

Example:

```json
{
    "connections": {
        "accepted": 1067,
        "active": 13,
        "idle": 4,
        "closed": 1050
    },

    "requests": {
        "total": 1307
    },

    "applications": {
        "wp": {
            "processes": {
                "running": 14,
                "starting": 0,
                "idle": 4
            },

            "requests": {
                "active": 10
            }
        }
    }
}
```

The **connections** object offers the following Unit instance metrics:

| Option       | Description                                                             |
|--------------|-------------------------------------------------------------------------|
| **accepted** | Integer;<br/>total accepted connections during the instance’s lifetime. |
| **active**   | Integer;<br/>current active connections for the instance.               |
| **idle**     | Integer;<br/>current idle connections for the instance.                 |
| **closed**   | Integer;<br/>total closed connections during the instance’s lifetime.   |

Example:

```json
"connections": {
    "accepted": 1067,
    "active": 13,
    "idle": 4,
    "closed": 1050
}
```

#### NOTE
For details of instance connection management,
refer to
[Settings](configuration.md#configuration-stngs).

The **requests** object currently exposes a single instance-wide metric:

| Option    | Description                                                         |
|-----------|---------------------------------------------------------------------|
| **total** | Integer;<br/>total non-API requests during the instance’s lifetime. |

Example:

```json
"requests": {
    "total": 1307
}
```

Each item in **applications** describes an app
currently listed in the **/config/applications**
[section](configuration.md#configuration-applications):

| Option        | Description                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------|
| **processes** | Object;<br/>lists per-app process statistics.                                                   |
| **requests**  | Object;<br/>similar to **/status/requests**,<br/>but includes only the data for a specific app. |

Example:

```json
"applications": {
    "wp": {
        "processes": {
            "running": 14,
            "starting": 0,
            "idle": 4
        },

        "requests": {
            "active": 10
        }
    }
}
```

The **processes** object exposes the following per-app metrics:

| Option       | Description                                  |
|--------------|----------------------------------------------|
| **running**  | Integer;<br/>current running app processes.  |
| **starting** | Integer;<br/>current starting app processes. |
| **idle**     | Integer;<br/>current idle app processes.     |

Example:

```json
"processes": {
    "running": 14,
    "starting": 0,
    "idle": 4
}
```

#### NOTE
For details of per-app process management,
refer to
[Process management](configuration.md#configuration-proc-mgmt).
