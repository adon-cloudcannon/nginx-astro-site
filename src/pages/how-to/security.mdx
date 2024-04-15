---
layout: "@layouts/BaseLayout.astro"
title: Security Checklist
---
# Security Checklist

At its core, Unit has security as one of its top priorities; our development
follows the appropriate best practices focused on making the code robust and
solid.  However, even the most hardened system requires proper setup,
configuration, and maintenance.

This guide lists the steps to protect your Unit from installation to individual
app configuration.

<a id="security-update"></a>

## Update Unit Regularly

**Rationale**: Each release introduces [bug fixes and new
features](/CHANGES.txt) that improve your installation’s security.

**Actions**: Follow our latest [news](https://mailman.nginx.org/mailman3/lists/unit.nginx.org/) and upgrade to new
versions shortly after they are released.

Specific upgrade steps depend on your installation method:

- The recommended option is to use our official [packages](../installation.md#installation-precomp-pkgs) or Docker [images](../installation.md#installation-docker); with them, it’s just a matter of updating
  **unit-\*** packages with your package manager of choice or
  switching to a newer image.
- If you use a third-party installation [method](../installation.md#installation-community-repos), consult the maintainer’s documentation
  for details.
- If you install Unit from [source files](../installation.md#source),
  rebuild and reinstall Unit and its modules from scratch.

<a id="security-socket-state"></a>

## Secure Socket and State

**Rationale**: Your [control socket and state directory](source.md#source-dir) provide unlimited access to Unit’s configuration, which
calls for stringent protection.

**Actions**: Default configuration in our [official packages](../installation.md#installation-precomp-pkgs) is usually sufficient; if you use another
installation method, ensure the control socket and the state directory are
safe.

If you use a UNIX control socket, ensure it is available to **root**
only:

```bash
$ unitd -h

      ...
      --control ADDRESS    set address of control API socket
                           default: "unix::nxt_ph:`/default/path/to/control.unit.sock <Build-time setting, can be overridden>`"

$ ps ax | grep unitd

      ... unit: main v1.32.1 [... --control :nxt_ph:`/path/to/control.sock <Make sure to check for runtime overrides>` ...]

# ls -l :nxt_ph:`/path/to/control.unit.sock <If it's overridden, use the runtime setting>`

      srw------- 1 root root 0 ... /path/to/control.unit.sock
```

UNIX domain sockets aren’t network accessible; for remote access, use
[NGINX](integration.md#nginx-secure-api) or a solution such as SSH:

```bash
$ ssh -N -L :nxt_hint:`./here.sock <Local socket>`::nxt_ph:`/path/to/control.unit.sock <Socket on the Unit server; use a real path in your command>` root@:nxt_hint:`unit.example.com <Unit server hostname>` &
$ curl --unix-socket :nxt_hint:`./here.sock <Use the local socket to configure Unit>`

      {
          "certificates": {},
          "config": {
              "listeners": {},
              "applications": {}
          }
      }
```

If you prefer an IP-based control socket, avoid public IPs; they expose the
[control API](../controlapi.md#configuration-api) and all its capabilities.  This means
your Unit instance can be manipulated by whoever is physically able to
connect:

```bash
# unitd --control 203.0.113.14:8080
$ curl 203.0.113.14:8080

      {
          "certificates": {},
          "config": {
              "listeners": {},
              "applications": {}
          }
      }
```

Instead, opt for the loopback address to ensure all access is local to your
server:

```bash
# unitd --control 127.0.0.1:8080
$ curl 203.0.113.14:8080

    curl: (7) Failed to connect to 203.0.113.14 port 8080: Connection refused
```

However, any processes local to the same system can access the local socket,
which calls for additional measures.  A go-to solution would be using NGINX
to [proxy](integration.md#nginx-secure-api) Unit’s control API.

The state directory stores Unit’s internal configuration between launches.
Avoid manipulating it or relying on its contents even if tempted to do so.
Instead, use only the control API to manage Unit’s configuration.

Also, the state directory should be available only to **root** (or the
user that the **main** [process](#security-apps) runs as):

```bash
$ unitd -h

      ...
      --state DIRECTORY    set state directory name
                           default: ":nxt_ph:`/default/path/to/unit/state/ <Build-time setting, can be overridden>`"

$ ps ax | grep unitd

      ... unit: main v1.32.1 [... --state :nxt_ph:`/path/to/unit/state/ <Make sure to check for runtime overrides>` ...]

# ls -l :nxt_ph:`/path/to/unit/state/ <If it's overridden, use the runtime setting>`

      drwx------ 2 root root 4096 ...
```

<a id="security-ssl"></a>

## Configure SSL/TLS

**Rationale**: To protect your client connections in production scenarios,
configure SSL certificate bundles for your Unit installation.

**Actions**: For details, see [SSL/TLS certificates](../certificates.md#configuration-ssl) and [TLS with Certbot](certbot.md).

<a id="security-routes"></a>

## Error-Proof Your Routes

**Rationale**: Arguably, [routes](../configuration.md#configuration-routes) are the most
flexible and versatile part of the Unit configuration.  Thus, they must be as
clear and robust as possible to avoid loose ends and gaping holes.

**Actions**: Familiarize yourself with the [matching](../configuration.md#configuration-routes-matching) logic and double-check all [patterns](../configuration.md#configuration-routes-matching-patterns) that you use.

Some considerations:

- Mind that [variables](../configuration.md#configuration-variables) contain arbitrary
  user-supplied request values; variable-based **pass** values in
  [listeners](../configuration.md#configuration-listeners) and [routes](../configuration.md#configuration-routes-action) must account for malicious requests, or the
  requests must be properly filtered.
- Create [matching rules](../configuration.md#configuration-routes-matching) to
  formalize the restrictions of your Unit instance and the apps it runs.
- Configure [shares](../configuration.md#configuration-static) only for directories and
  files you intend to make public.

<a id="security-apps"></a>

## Protect App Data

**Rationale**: Unit’s architecture involves many processes that operate
together during app delivery; improper process permissions can make sensitive
files available across apps or even publicly.

**Actions**: Properly configure your app directories and shares: apps and the
router process need access to them.  Still, avoid loose rights such as the
notorious **777**, instead assigning them on a need-to-know basis.

To configure file permissions for your apps, check Unit’s build-time and
run-time options first:

```bash
$ unitd -h

      ...
      --user USER          set non-privileged processes to run as specified user
                           default: ":nxt_ph:`unit_user <Build-time setting, can be overridden>`"

      --group GROUP        set non-privileged processes to run as specified group
                           default: user's primary group

$ ps ax | grep unitd

      ... unit: main v1.32.1 [... --user :nxt_ph:`unit_user <Make sure to check for runtime overrides>` --group :nxt_ph:`unit_group <Make sure to check for runtime overrides>` ...]
```

In particular, this is the account the router process runs as.  Use this
information to set up permissions for the app code or binaries and shared
static files.  The main idea is to limit each app to its own files and
directories while simultaneously allowing Unit’s router process to access
static files for all apps.

Specifically, the requirements are as follows:

- All apps should run as different users so that the permissions can be
  configured properly.  Even if you run a single app, it’s reasonable to
  create a dedicated user for added flexibility.
- An app’s code or binaries should be reachable for the user the app runs
  as; the static files should be reachable for the router process.  Thus,
  each part of an app’s directory path must have execute permissions
  assigned for the respective users.
- An app’s directories should not be available to other apps or
  non-privileged system users. The router process should be able to access
  the app’s static file directories.  Accordingly, the app’s directories
  must have read and execute permissions assigned for the respective users.
- The files and directories that the app is designed to update should
  be writable only for the user the app runs as.
- The app code should be readable (and executable in case of [external](modules.md#modules-ext) apps) for the user the app runs as; the static content
  should be readable for the router process.

A detailed walkthrough to guide you through each requirement:

1. If you have several independent apps, running them with a single user
   account poses a security risk.  Consider adding a separate system user
   and group per each app:
   ```bash
   # :nxt_hint:`useradd <Add user account without home directory>` -M app_user
   # groupadd app_group
   # :nxt_hint:`usermod <Deny interactive login>` -L app_user
   # :nxt_hint:`usermod <Add user to the group>` -a -G app_group app_user
   ```

   Even if you run a single app, this helps if you add more apps or need to
   decouple permissions later.
2. It’s important to add Unit’s non-privileged user account to *each* app
   group:
   ```bash
   # usermod -a -G app_group unit_user
   ```

   Thus, Unit’s router process can access each app’s directory and serve
   files from each app’s shares.
3. A frequent source of issues is the lack of permissions for directories
   inside a directory path needed to run the app, so check for that if in
   doubt.  Assuming your app code is stored at **/path/to/app/**:
   ```bash
   # ls -l /

         :nxt_hint:`drwxr-xr-x <Permissions are OK>`  some_user some_group  path

   # ls -l /path/

         :nxt_hint:`drwxr-x--- <Permissions are too restrictive>`  some_user some_group  to
   ```

   This may be a problem because the **to/** directory isn’t owned by
   **app_user:app_group** and denies all permissions to non-owners (as
   the **---** sequence tells us), so a fix can be warranted:
   ```bash
   # :nxt_hint:`chmod <Add read/execute permissions for non-owners>` o+rx /path/to/
   ```

   Another solution is to add **app_user** to **some_group**
   (assuming this was not done before):
   ```bash
   # usermod -a -G some_group app_user
   ```
4. Having checked the directory tree, assign ownership and permissions for
   your app’s directories, making them reachable for Unit and the app:
   ```bash
   # :nxt_hint:`chown <Assign ownership for the app code>` -R app_user:app_group :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your command>`
   # :nxt_hint:`chown <Assign ownership for the static files>` -R app_user:app_group :nxt_ph:`/path/to/static/app/files/ <Can be outside the app directory tree; use a real path in your command>`
   # find :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your command>` -type d -exec :nxt_hint:`chmod <Add read/execute permissions to app code directories for user and group>` u=rx,g=rx,o= {} \;
   # find :nxt_ph:`/path/to/static/app/files/ <Can be outside the app directory tree; use a real path in your command>` -type d -exec :nxt_hint:`chmod <Add read/execute permissions to static file directories for user and group>` u=rx,g=rx,o= {} \;
   ```
5. If the app needs to update specific directories or files, make sure
   they’re writable for the app alone:
   ```bash
   # :nxt_hint:`chmod <Add write permissions for the user only; the group shouldn't have them>` u+w :nxt_ph:`/path/to/writable/file/or/directory/ <Repeat for each file or directory that must be writable>`
   ```

   In case of a writable directory, you may also want to prevent non-owners
   from messing with its files:
   ```bash
   # :nxt_hint:`chmod <Sticky bit prevents non-owners from deleting or renaming files>` +t :nxt_ph:`/path/to/writable/directory/ <Repeat for each directory that must be writable>`
   ```

   #### NOTE
   Usually, apps store and update their data outside the app code
   directories, but some apps may mix code and data.  In such a case,
   assign permissions on an individual basis, making sure you understand
   how the app uses each file or directory: is it code, read-only
   content, or writable data.
6. For [embedded](modules.md#modules-emb) apps, it’s usually enough to make the
   app code and the static files readable:
   ```bash
   # find :nxt_ph:`/path/to/app/code/ <Path to the application's code directory; use a real path in your command>` -type f -exec :nxt_hint:`chmod <Add read rights to app code for user and group>` u=r,g=r,o= {} \;
   # find :nxt_ph:`/path/to/static/app/files/ <Can be outside the app directory tree; use a real path in your command>` -type f -exec :nxt_hint:`chmod <Add read rights to static files for user and group>` u=r,g=r,o= {} \;
   ```
7. For [external](modules.md#modules-emb) apps, additionally make the app code or
   binaries executable:
   ```bash
   # find :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your command>` -type f -exec :nxt_hint:`chmod <Add read and execute rights to app code for user and group>` u=rx,g=rx,o= {} \;
   # find :nxt_ph:`/path/to/static/app/files/ <Can be outside the app directory tree; use a real path in your command>` -type f -exec :nxt_hint:`chmod <Add read rights to static files for user and group>` u=r,g=r,o= {} \;
   ```
8. To run a single app, [configure](../configuration.md) Unit as follows:
   ```json
   {
       "listeners": {
           ":nxt_hint:`*:80 <Or another suitable socket address>`": {
               "pass": "routes"
           }
       },

       "routes": [
           {
               "action": {
                   "share": ":nxt_ph:`/path/to/static/app/files/ <Router process needs read and execute permissions to serve static content from this directory>`$uri",
                   "fallback": {
                       "pass": "applications/app"
                   }
               }
           }
       ],

       "applications": {
           "app": {
               "type": "...",
               "user": "app_user",
               "group": "app_group"
           }
       }
   }
   ```
9. To run several apps side by side, [configure](../configuration.md)
   them with appropriate user and group names.  The following
   configuration distinguishes apps based on the request URI, but you can
   implement another scheme such as different listeners:
   ```json
   {
       "listeners": {
           ":nxt_hint:`*:80 <Or another suitable socket address>`": {
               "pass": "routes"
           }
       },

       "routes": [
           {
               "match": {
                   "uri": ":nxt_hint:`/app1/* <Arbitrary matching condition>`"
               },

               "action": {
                   "share": ":nxt_ph:`/path/to/static/app1/files/ <Router process needs read and execute permissions to serve static content from this directory>`$uri",
                   "fallback": {
                       "pass": "applications/app1"
                   }
               }
           },

           {
               "match": {
                   "uri": ":nxt_hint:`/app2/* <Arbitrary matching condition>`"
               },

               "action": {
                   "share": ":nxt_ph:`/path/to/static/app2/files/ <Router process needs read and execute permissions to serve static content from this directory>`$uri",
                   "fallback": {
                       "pass": "applications/app2"
                   }
               }
           }
       ],

       "applications": {
           "app1": {
               "type": "...",
               "user": "app_user1",
               "group": "app_group1"
           },

           "app2": {
               "type": "...",
               "user": "app_user2",
               "group": "app_group2"
           }
       }
   }
   ```

#### NOTE
As usual with permissions, different steps may be required if you use
ACLs.

Unfortunately, quite a few web apps are built in a manner that mixes their
source code, data, and configuration files with static content, which calls
for complex access restrictions.  The situation is further aggravated by the
inevitable need for maintenance activities that may leave a footprint of
extra files and directories unrelated to the app’s operation.  The issue has
several aspects:

- Storage of code and data at the same locations, which usually happens by
  (insufficient) design.  You neither want your internal data and code files
  to be freely downloadable nor your user-uploaded data to be executable as
  code, so configure your routes and apps to prevent both.
- Exposure of configuration data.  Your app-specific settings, **.ini**
  or **.htaccess** files, and credentials are best kept hidden from
  prying eyes, and your routing configuration should reflect that.
- Presence of hidden files from versioning, backups by text editors, and
  other temporary files.  Instead of carving your configuration around
  these, it’s best to keep your app free of them altogether.

If these can’t be avoided, investigate the inner workings of the app to
prevent exposure, for example:

```json
{
    "routes": {
        "app": [
            {
                "match": {
                    ":nxt_hint:`uri <Handles requests that target PHP scripts to avoid having them served as static files>`": [
                        "*.php",
                        "*.php/*"
                    ]
                },

                "action": {
                    "pass": "applications/app/direct"
                }
            },
            {
                "match": {
                    ":nxt_hint:`uri <Protects files and directories best kept hidden>`": [
                        ":nxt_hint:`!/sensitive/* <Restricts access to a directory with sensitive data>`",
                        ":nxt_hint:`!/data/* <Restricts access to a directory with sensitive data>`",
                        ":nxt_hint:`!/app_config_values.ini <Restricts access to a specific file>`",
                        ":nxt_hint:`!*/.* <Restricts access to hidden files and directories>`",
                        ":nxt_hint:`!*~ <Restricts access to temporary files>`"
                    ]
                },

                "action": {
                    ":nxt_hint:`share <Serves valid requests with static content>`": ":nxt_ph:`/path/to/app/static <Path to the application's static file directory; use a real path in your configuration>`$uri",
                    ":nxt_hint:`types <Limits file types served from the share>`": [
                        "image/*",
                        "text/*",
                        "application/javascript"
                    ],

                    ":nxt_hint:`fallback <Relays all requests not yet served to a catch-all app target>`": {
                        "pass": "applications/app/index"
                    }
                }
            }
        ]
    }
}
```

However, this does not replace the need to set up file permissions; use both
[matching rules](../configuration.md#configuration-routes-matching) and per-app user
permissions to manage access.  For more info and real-life examples, refer
to our app [howtos](index.md) and the ‘File Permissions’ callout above.

<a id="security-processes"></a>

Unit’s processes are detailed [elsewhere](https://www.nginx.com/blog/introducing-nginx-unit/), but here’s a
synopsis of the different roles they have:

| Process       | Privileged?   | User and Group                                                                                                                                      | Description                                                                                                                                                                                  |
|---------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Main          | Yes           | Whoever starts the **unitd** executable; by default,<br/>**root**.                                                                                  | Runs as a daemon, spawning Unit’s non-privileged and app processes;<br/>requires numerous system capabilities and privileges for operation.                                                  |
| Controller    | No            | Set by `--user` and `--group` options at<br/>[build](source.md#source-config-src) or [execution](source.md#source-startup); by default, **unit**.   | Serves the control API, accepting reconfiguration requests,<br/>sanitizing them, and passing them to other processes for<br/>implementation.                                                 |
| Discovery     | No            | Set by `--user` and `--group` options at<br/>[build](source.md#source-config-src) or [execution](source.md#source-startup); by default, **unit**.   | Discovers the language modules in the module directory at startup,<br/>then quits.                                                                                                           |
| Router        | No            | Set by `--user` and `--group` options at<br/>[build](source.md#source-config-src) or [execution](source.md#source-startup); by default, **unit**.   | Serves client requests, accepting them, processing them on the spot,<br/>passing them to app processes, or proxying them further; requires<br/>access to static content paths you configure. |
| App processes | No            | Set by per-app **user** and **group**<br/>[options](../configuration.md#configuration-applications); by default,<br/>`--user` and `--group` values. | Serve client requests that are routed to apps; require access to<br/>paths and namespaces you configure for the app.                                                                         |

You can check all of the above on your system when Unit is running:

```bash
$ ps aux | grep unit

      ...
      root   ... unit: main v1.32.1
      unit   ... unit: controller
      unit   ... unit: router
      unit   ... unit: "front" application
```

The important outtake here is to understand that Unit’s non-privileged
processes don’t require running as **root**.  Instead, they should have
the minimal privileges required to operate, which so far means the ability
to open connections and access the application code and the static files
shared during routing.

<a id="security-logs"></a>

## Prune Debug and Access Logs

**Rationale**: Unit stores potentially sensitive data in its general and access
logs; their size can also become a concern if debug mode is enabled.

**Actions**: Secure access to the logs and ensure they don’t exceed the allowed
disk space.

Unit can maintain two different logs:

- A general-purpose log that is enabled by default and can be switched to
  debug mode for verbosity.
- An access log that is off by default but can be enabled via the control
  API.

If you enable debug-mode or access logging, rotate these logs with tools
such as **logrotate** to avoid overgrowth.  A sample
**logrotate** [configuration](https://man7.org/linux/man-pages/man8/logrotate.8.html#CONFIGURATION_FILE_DIRECTIVES):

```none
:nxt_ph:`/path/to/unit.log <Use a real path in your configuration>` {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    nocreate
    notifempty
    su root root
    postrotate
        if [ -f :nxt_ph:`/path/to/unit.pid <Use a real path in your configuration>` ]; then
            :nxt_hint:`/bin/kill <Signals Unit to reopen the log>` -SIGUSR1 `cat :nxt_ph:`/path/to/unit.pid <Use a real path in your configuration>``
        fi
    endscript
}
```

To figure out the log and PID file paths:

```bash
$ unitd -h

      ...
      --pid FILE           set pid filename
                           default: ":nxt_ph:`/default/path/to/unit.pid <Build-time setting, can be overridden>`"

      --log FILE           set log filename
                           default: ":nxt_ph:`/default/path/to/unit.log <Build-time setting, can be overridden>`"

$ ps ax | grep unitd

      ... unit: main v1.32.1 [... --pid :nxt_ph:`/path/to/unit.pid <Make sure to check for runtime overrides>` --log :nxt_ph:`/path/to/unit.log <Make sure to check for runtime overrides>` ...]
```

Another issue is the logs’ accessibility.  Logs are opened and updated by
the [main process](#security-apps) that usually runs as **root**.
However, to make them available for a certain consumer, you may need to
enable access for a dedicated user that the consumer runs as.

Perhaps, the most straightforward way to achieve this is to assign log
ownership to the consumer’s account.  Suppose you have a log utility running
as **log_user:log_group**:

```bash
# :nxt_hint:`chown <Assign ownership to the log user>` log_user:log_group :nxt_ph:`/path/to/unit.log <If it's overridden, use the runtime setting>`

# :nxt_hint:`curl <Enable access log in the Unit configuration at the given path>` -X PUT -d '":nxt_ph:`/path/to/access.log <Use a real path in your configuration>`"'  \
       --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket>` \
       http://localhost/config/access_log

      {
          "success": "Reconfiguration done."
      }

# :nxt_hint:`chown <Assign ownership to the log user>` log_user:log_group :nxt_ph:`/path/to/access.log <Use a real path in your command>`
```

If you change the log file ownership, adjust your **logrotate**
settings accordingly:

```none
:nxt_ph:`/path/to/unit.log <Use a real path in your configuration>` {
    ...
    su log_user log_group
    ...
}
```

#### NOTE
As usual with permissions, different steps may be required if you use
ACLs.

<a id="security-isolation"></a>

## Add Restrictions, Isolation

**Rationale**: If the underlying OS allows, Unit provides features that create an
additional level of separation and containment for your apps, such as:

- Share [path restrictions](../configuration.md#configuration-share-path)
- Namespace and file system root [isolation](../configuration.md#configuration-proc-mgmt-isolation)

**Actions**: For more details, see our blog posts on [path restrictions](https://www.nginx.com/blog/nginx-unit-updates-for-summer-2021-now-available/#Static-Content:-Chrooting-and-Path-Restrictions),
[namespace](https://www.nginx.com/blog/application-isolation-nginx-unit/) and
[file system](https://www.nginx.com/blog/filesystem-isolation-nginx-unit/)
isolation.
