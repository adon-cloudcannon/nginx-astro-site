---
layout: "@layouts/BaseLayout.astro"
title: Troubleshooting
order: 10
---
# Troubleshooting

<a id="troubleshooting-log"></a>

## Logging

Unit maintains a single general-purpose

for diagnostics and troubleshooting
(not to be confused with the
[access log](configuration.md#configuration-access-log)).
To find out its default location in your installation:

```bash
$ unitd -h

    unit options:
    ...
    --log FILE           set log filename
                         default: "/path/to/unit.log"
```

The **--log** option overrides the default value;
if Unit is already running,
check whether this option is set:

```bash
$ ps ax | grep unitd
    ...
    unit: main v1.32.1 [/path/to/unitd ... --log /path/to/unit.log ...]
```

If Unit isn’t running,
see its system startup scripts or configuration files
to check if **--log** is set,
and how.

Available log levels:

- **[alert]**: Non-fatal errors such as app exceptions or misconfigurations.
- **[error]**: Serious errors such as invalid ports or addresses.
- **[warn]**: Recoverable issues such as **umount2(2)** failures.
- **[notice]**: Self-diagnostic and router events.
- **[info]**: General-purpose reporting.
- **[debug]**: Debug events.

#### NOTE
Mind that our Docker images forward their log output to the
[Docker log collector](https://docs.docker.com/config/containers/logging/)
instead of a file.

<a id="troubleshooting-router-log"></a>

### Router events

The **log_route** option
in Unit’s
[settings](configuration.md#configuration-stngs)
allows recording
[routing choices](configuration.md#configuration-routes-matching)
in the general-purpose log:

| Event               | Log Level    | Description                                                                           |
|---------------------|--------------|---------------------------------------------------------------------------------------|
| HTTP request line   | **[notice]** | Incoming<br/>[request line](https://datatracker.ietf.org/doc/html/rfc9112#section-3). |
| URI rewritten       | **[notice]** | The request URI is updated.                                                           |
| Route step selected | **[notice]** | The route step is selected<br/>to serve the request.                                  |
| Fallback taken      | **[notice]** | A **fallback** action is taken<br/>after the step is selected.                        |

Sample router logging output may look like this:

```none
[notice] 8308#8339 *16 http request line "GET / HTTP/1.1"
[info] 8308#8339 *16 "routes/0" discarded
[info] 8308#8339 *16 "routes/1" discarded
[notice] 8308#8339 *16 "routes/2" selected
[notice] 8308#8339 *16 URI rewritten to "/backend/"
[notice] 8308#8339 *16 "fallback" taken
```

It lists specific steps and actions
(such as **routes/2**)
that can be queried via the
[control API](controlapi.md)
for details:

```bash
# curl --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` http://localhost/config/:nxt_ph:`routes/2 <The step listed in the log>`
```

<a id="troubleshooting-dbg-log"></a>

### Debug Events

Unit’s log can be set to record **[debug]**-level events;
the steps to enable this mode
vary by install method.

#### WARNING
Debug log is meant for developers;
it grows rapidly,
so enable it only for detailed reports and inspection.

Our
[repositories](installation.md#installation-precomp-pkgs)
provide a debug version of **unitd** called **unitd-debug**
within the **unit** package:

```bash
# unitd-debug <command line options>
```

To enable debug-level logging when using our
[Docker images](installation.md#installation-docker):

```bash
$ docker run -d unit:1.32.1-minimal unitd-debug --no-daemon  \
      --control unix:/var/run/control.unit.sock
```

Another option is adding a new layer in a Dockerfile:

```docker
FROM unit:1.32.1-minimal

CMD ["unitd-debug","--no-daemon","--control","unix:/var/run/control.unit.sock"]
```

The **CMD** instruction above
replaces the default **unitd** executable
with its debug version.

To enable debug-level logging when
[installing from source](installation.md#source),
use the **--debug** option:

```bash
$ ./configure --debug <other options>
```

Then recompile and reinstall Unit
and your [language modules](howto/source.md#source-modules) of choice.

<a id="troubleshooting-core-dumps"></a>

## Core Dumps

Core dumps help us investigate crashes;
attach them when
[reporting an issue](#troubleshooting-support).
For builds from
[our repositories](installation.md#installation-precomp-pkgs),
we maintain debug symbols in special packages;
they have the original packages’ names with the **-dbg** suffix appended,
such as **unit-dbg**.

#### NOTE
This section assumes you’re running Unit as **root** (recommended).

To enable saving core dumps
while running Unit as a **systemd** service
(for example, with
[packaged installations](installation.md#installation-precomp-pkgs)),
adjust the
[service settings](https://www.freedesktop.org/software/systemd/man/systemd.exec.html)
in **/lib/systemd/system/unit.service**:

```ini
[Service]
...
LimitCORE=infinity
LimitNOFILE=65535
```

Alternatively,
update the
[global settings](https://www.freedesktop.org/software/systemd/man/systemd.directives.html)
in **/etc/systemd/system.conf**:

```ini
[Manager]
...
DefaultLimitCORE=infinity
DefaultLimitNOFILE=65535
```

Next,
reload the service configuration
and restart Unit
to reproduce the crash condition:

```bash
# systemctl daemon-reload
# systemctl restart unit.service
```

After a crash,
locate the core dump file:

```bash
# coredumpctl -1                     # optional

      TIME                            PID   UID   GID SIG COREFILE  EXE
      Mon 2020-07-27 11:05:40 GMT    1157     0     0  11 present   /usr/sbin/unitd

# ls -al /var/lib/systemd/coredump/  # default, see also /etc/systemd/coredump.conf and /etc/systemd/coredump.conf.d/*.conf

      ...
      -rw-r----- 1 root root 177662 Jul 27 11:05 core.unitd.0.6135489c850b4fb4a74795ebbc1e382a.1157.1590577472000000.lz4
```

Check the
[core dump settings](https://www.man7.org/linux/man-pages/man5/limits.conf.5.html)
in **/etc/security/limits.conf**,
adjusting them if necessary:

```none
root           soft    core       0          # disables core dumps by default
root           hard    core       unlimited  # enables raising the size limit
```

Next, raise the core dump size limit with
[ulimit](https://www.man7.org/linux/man-pages/man1/bash.1.html#SHELL_BUILTIN_COMMANDS),
then restart Unit
to reproduce the crash condition:

```bash
# ulimit -c unlimited
# cd :nxt_ph:`/path/to/unit/ <Unit's installation directory>`
# sbin/unitd           # or sbin/unitd-debug
```

After a crash,
locate the core dump file:

```bash
# ls -al :nxt_ph:`/path/to/unit/working/directory/ <Unit's working directory>`  # default location, see /proc/sys/kernel/core_pattern

      ...
      -rw-r----- 1 root root 177662 Jul 27 11:05 core.1157
```

Check the
[core dump settings](https://www.freebsd.org/cgi/man.cgi?sysctl.conf(5))
in **/etc/sysctl.conf**,
adjusting them if necessary:

```ini
kern.coredump=1
# must be set to 1
kern.corefile=/path/to/core/files/%N.core
# must provide a valid pathname
```

Alternatively,
update the settings in runtime:

```bash
# sysctl kern.coredump=1
# sysctl kern.corefile=/path/to/core/files/%N.core
```

Next, restart Unit
to reproduce the crash condition.
If Unit is installed as a service:

```bash
# service unitd restart
```

If it’s installed manually:

```bash
# cd :nxt_ph:`/path/to/unit/ <Unit's installation directory>`
# sbin/unitd
```

After a crash,
locate the core dump file:

```bash
# ls -al :nxt_ph:`/path/to/core/files/ <Core dump directory>`

      ...
      -rw-------  1 root     root  9912320 Jul 27 11:05 unitd.core
```

<a id="troubleshooting-support"></a>

## Getting Support

| Support Channel   | Details                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GitHub            | Visit our<br/>[repo](https://github.com/nginx/unit)<br/>to submit issues,<br/>suggest features,<br/>ask questions,<br/>or see the roadmap.                                                                                                                                                                                                                                                                                          |
| Mailing lists     | To post questions to [unit@nginx.org](mailto:unit@nginx.org) and get notifications,<br/>including release news,<br/>email [unit-subscribe@nginx.org](mailto:unit-subscribe@nginx.org)<br/>or sign up<br/>[here](https://mailman.nginx.org/mailman/listinfo/unit).<br/>To receive all OSS release announcements from NGINX,<br/>join the general mailing list<br/>[here](https://mailman.nginx.org/mailman/listinfo/nginx-announce). |
| Security alerts   | Please report security issues to<br/>[security-alert@nginx.org](mailto:security-alert@nginx.org),<br/>specifically mentioning NGINX Unit in the subject<br/>and following the<br/>[CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document)<br/>specification.                                                                                                                                                            |

In addition,
we offer [commercial support](https://www.nginx.com/support/).
