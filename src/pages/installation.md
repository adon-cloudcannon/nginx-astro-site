---
layout: "@layouts/BaseLayout.astro"
title: Installation
order: 3
---
# Installation

You can install NGINX Unit in four alternative ways:

- Choose from our official [binary packages](#installation-precomp-pkgs)
  for a few popular systems.
  They’re as easy to use as any other packaged software
  and suit most purposes straight out of the box.
- If your preferred OS or language version
  is missing from the official package list,
  try [third-party repositories](#installation-community-repos).
  Be warned, though: we don’t maintain them.
- Run our [Docker official images](#installation-docker),
  prepackaged with varied language combinations.
- To fine-tune Unit to your goals,
  download the [sources](#source),
  install the [toolchain](howto/source.md#source-prereq-build),
  and [build](howto/source.md#source-config-src) a custom binary from scratch;
  just make sure you know what you’re doing.

<a id="source-prereqs"></a>

## Prerequisites

Unit compiles and runs on various Unix-like operating systems, including:

- FreeBSD 10 or later
- Linux 2.6 or later
- macOS 10.6 or later
- Solaris 11

It also supports most modern instruction set architectures, such as:

- ARM
- IA-32
- PowerPC
- MIPS
- S390X
- x86-64

App languages and platforms that Unit can run
(including several versions of the same language):

- Go 1.6 or later
- Java 8 or later
- Node.js 8.11 or later
- PHP 5, 7, 8
- Perl 5.12 or later
- Python 2.6, 2.7, 3
- Ruby 2.0 or later
- WebAssembly Components WASI 0.2

Optional dependencies:

- OpenSSL 1.0.1 or later for [TLS](certificates.md#configuration-ssl) support
- PCRE (8.0 or later) or PCRE2 (10.23 or later)
  for [regular expression matching](configuration.md#configuration-routes-matching-patterns-regex)
- The
  [njs](https://nginx.org/en/docs/njs/)
  scripting language
- Wasmtime for WebAssembly Support

<a id="installation-precomp-pkgs"></a>

## Official packages

Installing an official precompiled Unit binary package
is best on most occasions;
they’re available for:

- Amazon Linux [AMI](#amazon-ami),
  Amazon Linux [2](#amazon-20lts),
  Amazon Linux [2023](#amazon-2023)
- Debian [9](#debian-9),
  [10](#debian-10),
  [11](#debian-11),
  [12](#debian-12)
- Fedora [29](#fedora-29),
  [30](#fedora-3130),
  [31](#fedora-3130),
  [32](#fedora-32),
  [33](#fedora-3433),
  [34](#fedora-3433),
  [35](#fedora-3635),
  [36](#fedora-3635),
  [37](#fedora-37),
  [38](#fedora-38)
- RHEL [6](#rhel-6x),
  [7](#rhel-7x),
  [8](#rhel-8x),
  [9](#rhel-9x)
- Ubuntu [16.04](#ubuntu-1604),
  [18.04](#ubuntu-1804),
  [19.10](#ubuntu-1910),
  [20.04](#ubuntu-2004),
  [20.10](#ubuntu-2010),
  [21.04](#ubuntu-2104),
  [21.10](#ubuntu-2110),
  [22.04](#ubuntu-2204),
  [22.10](#ubuntu-2210),
  [23.04](#ubuntu-2304)

The packages include core executables,
developer files,
and support for individual languages.
We also maintain a Homebrew [tap](#macos-homebrew) for
macOS users and a [module](#installation-nodejs-package) for Node.js
at the [npm](https://www.npmjs.com/package/unit-http) registry.

#### NOTE
For details of packaging custom modules
that install alongside the official Unit,
see [here](howto/modules.md#modules-pkg).

We provide a [script](https://github.com/nginx/unit/tree/master/tools)
that adds our official repos on the systems we support:

```bash
$ wget https://raw.githubusercontent.com/nginx/unit/master/tools/setup-unit && chmod +x setup-unit
# ./setup-unit repo-config
```

Use it at your discretion;
explicit steps are provided below
for each distribution.

<a id="installation-precomp-amazon"></a>

### Amazon Linux

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/amzn/2023/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc17 unit-perl  \
         unit-php unit-python39 unit-python311 unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/amzn2/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-perl  \
         unit-php unit-python27 unit-python37 unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.22+ packages aren’t built for Amazon Linux AMI.
This distribution is obsolete;
please update.

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/amzn/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-perl unit-php  \
         unit-python27 unit-python34 unit-python35 unit-python36
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

<a id="installation-precomp-deb"></a>

### Debian

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bookworm unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bookworm unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc17 unit-perl  \
         unit-php unit-python3.11 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bullseye unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ bullseye unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc11 unit-perl  \
         unit-php unit-python2.7 unit-python3.9 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.28+ packages aren’t built for Debian 10.
This distribution is obsolete;
please update.

Supported architectures: i386, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ buster unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ buster unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc11 unit-perl  \
         unit-php unit-python2.7 unit-python3.7 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.22+ packages aren’t built for Debian 9.
This distribution is obsolete;
please update.

Supported architectures: i386, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ stretch unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/debian/ stretch unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc8 unit-perl  \
         unit-php unit-python2.7 unit-python3.5 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

<a id="installation-precomp-fedora"></a>

### Fedora

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/fedora/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11 unit-perl  \
         unit-php unit-python311 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/fedora/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11 unit-perl  \
         unit-php unit-python311 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.31+ packages aren’t built for Fedora 36 and Fedora 35.
These distributions are obsolete;
please update.

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/fedora/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11 unit-perl  \
         unit-php unit-python39 unit-python310 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.27+ packages aren’t built for Fedora 33 and Fedora 34.
These distributions are obsolete;
please update.

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/fedora/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11 unit-perl  \
         unit-php unit-python39 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.24+ packages aren’t built for Fedora 32.
These distributions are obsolete;
please update.

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/fedora/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11 unit-perl  \
         unit-php unit-python38 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.20+ packages aren’t built for Fedora 30;
1.22+ packages aren’t built for Fedora 31.
These distributions are obsolete;
please update.

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/fedora/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11 unit-perl  \
         unit-php unit-python27 unit-python37 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.20+ packages aren’t built for Fedora 29.
This distribution is obsolete;
please update.

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/fedora/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-perl  \
         unit-php unit-python27 unit-python37 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

<a id="installation-precomp-centos"></a>

<a id="installation-precomp-rhel"></a>

### RHEL and derivatives

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/rhel/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module and build Go apps>` unit-go unit-jsc8 unit-jsc11  \
         unit-perl unit-php unit-python39 unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/rhel/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11  \
         unit-perl unit-php unit-python27 unit-python36 unit-python38 unit-python39 unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### NOTE
Official packages for CentOS 7.x are also available.

Supported architecture: x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/rhel/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-jsc11  \
         unit-perl unit-php unit-python27 unit-python36
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.20+ packages aren’t built for RHEL 6.
This distribution is obsolete;
please update.

Supported architectures: i386, x86-64.

1. To configure Unit’s repository,
   create the following file named
   **/etc/yum.repos.d/unit.repo**:
   ```ini
   [unit]
   name=unit repo
   baseurl=https://packages.nginx.org/unit/rhel/$releasever/$basearch/
   gpgcheck=0
   enabled=1
   ```
2. Install the core package
   and other packages you need:
   ```bash
   # yum install unit
   # yum install :nxt_hint:`unit-devel <Required to install the Node.js module>` unit-jsc8 unit-perl  \
         unit-php unit-python
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](controlapi.md#configuration-socket)             | **/var/run/unit/control.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**       |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### NOTE
Use these steps
for binary-compatible distributions:
AlmaLinux,
CentOS,
Oracle Linux,
or Rocky Linux.

<a id="installation-precomp-ubuntu"></a>

### Ubuntu

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ lunar unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ lunar unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module and build Go apps>` unit-go unit-jsc11 unit-jsc17 unit-jsc18 unit-jsc19 unit-jsc20  \
                 unit-perl unit-php unit-python3.11 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.31+ packages aren’t built for Ubuntu 22.10.
This distribution is obsolete;
please update.

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ kinetic unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ kinetic unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module and build Go apps>` unit-go unit-jsc11 unit-jsc17 unit-jsc18 unit-jsc19  \
                 unit-perl unit-php unit-python2.7 unit-python3.10 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ jammy unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ jammy unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module and build Go apps>` unit-go unit-jsc11 unit-jsc16 unit-jsc17 unit-jsc18  \
                 unit-perl unit-php unit-python2.7 unit-python3.10 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.28+ packages aren’t built for Ubuntu 21.10.
This distribution is obsolete;
please update.

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ impish unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ impish unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc11 unit-jsc16 unit-jsc17 unit-jsc18  \
                 unit-perl unit-php unit-python2.7 unit-python3.9 unit-python3.10 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.27+ packages aren’t built for Ubuntu 21.04.
This distribution is obsolete;
please update.

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ hirsute unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ hirsute unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc11 unit-jsc15 unit-jsc16 unit-jsc17  \
                 unit-perl unit-php unit-python2.7 unit-python3.9 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.25+ packages aren’t built for Ubuntu 20.10.
This distribution is obsolete;
please update.

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ groovy unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ groovy unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc11 unit-jsc13 unit-jsc14 unit-jsc15  \
                 unit-perl unit-php unit-python3.8 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ focal unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ focal unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc11 unit-perl  \
         unit-php unit-python2.7 unit-python3.8 unit-ruby unit-wasm
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.20+ packages aren’t built for Ubuntu 19.10.
This distribution is obsolete;
please update.

Supported architecture: x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ eoan unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ eoan unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc11 unit-perl  \
         unit-php unit-python2.7 unit-python3.7 unit-python3.8 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.31+ packages aren’t built for Ubuntu 18.04.
This distribution is obsolete;
please update.

Supported architectures: arm64, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ bionic unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ bionic unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc8 unit-jsc11 unit-perl  \
         unit-php unit-python2.7 unit-python3.6 unit-python3.7 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

#### WARNING
Unit’s 1.24+ packages aren’t built for Ubuntu 16.04.
This distribution is obsolete;
please update.

Supported architectures: arm64, i386, x86-64.

1. Download and save NGINX’s signing key:
   ```bash
   # curl --output /usr/share/keyrings/nginx-keyring.gpg  \
         https://unit.nginx.org/keys/nginx-keyring.gpg
   ```

   This eliminates the
   “packages cannot be authenticated”
   warnings
   during installation.
2. To configure Unit’s repository,
   create the following file named
   **/etc/apt/sources.list.d/unit.list**:
   ```none
   deb [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ xenial unit
   deb-src [signed-by=/usr/share/keyrings/nginx-keyring.gpg] https://packages.nginx.org/unit/ubuntu/ xenial unit
   ```
3. Install the core package
   and other packages you need:
   ```bash
   # apt update
   # apt install unit
   # apt install :nxt_hint:`unit-dev <Required to install the Node.js module>` unit-jsc8 unit-perl unit-php  \
         unit-python2.7 unit-python3.5 unit-ruby
   # systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
   ```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**   |
|------------------------------------------------------------------|----------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**            |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                         |

<a id="installation-macos"></a>

<a id="homebrew"></a>

### macOS

To install Unit on macOS,
use the official Homebrew
[tap](https://github.com/nginx/homebrew-unit):

```bash
$ brew install nginx/unit/unit
```

This deploys the core Unit binary
and the prerequisites for the
[Node.js](#installation-nodejs-package)
language module.

To install the Java, Perl, Python, and Ruby language modules
from Homebrew:

```bash
$ brew install unit-java unit-perl unit-php unit-python unit-python3 unit-ruby
# pkill unitd  # Stop Unit
# unitd        # Start Unit to pick up any changes in language module setup
```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/usr/local/var/run/unit/control.sock** (Intel), **/opt/homebrew/var/run/unit/control.sock** (Apple Silicon)   |
|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/usr/local/var/log/unit/unit.log** (Intel), **/opt/homebrew/var/log/unit/unit.log** (Apple Silicon)           |
| Non-privileged [user and group](howto/security.md#security-apps) | **nobody**                                                                                                      |

#### NOTE
To run Unit as **root** on macOS:

```bash
$ export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
$ sudo --preserve-env=OBJC_DISABLE_INITIALIZE_FORK_SAFETY :nxt_ph:`/path/to/unitd <Unit's executable pathname>` ...
```

<a id="installation-nodejs-package"></a>

### Node.js

Unit’s npm-hosted Node.js
[module](https://www.npmjs.com/package/unit-http)
is called
**unit-http**.
Install it
to run Node.js apps on Unit:

1. First, install the **unit-dev/unit-devel**
   [package](#installation-precomp-pkgs);
   it’s needed to build **unit-http**.
2. Next, build and install **unit-http** globally
   (this requires **npm** and **node-gyp**):
   > ```bash
   > # npm install -g --unsafe-perm unit-http
   > ```

   > #### WARNING
   > The **unit-http** module is platform dependent
   > due to optimizations;
   > you can’t move it across systems
   > with the rest of **node-modules**.
   > Global installation avoids such scenarios;
   > just
   > [relink](configuration.md#configuration-nodejs)
   > the migrated app.
3. It’s entirely possible to run
   [Node.js apps](configuration.md#configuration-nodejs)
   on Unit
   without mentioning **unit-http** in your app sources.
   However, you can explicitly use **unit-http** in your code
   instead of the built-in **http**,
   but mind that such frameworks as Express may require extra
   [changes](howto/express.md).

If you update Unit later,
make sure to update the module as well:

```bash
# npm update -g --unsafe-perm unit-http
```

#### NOTE
You can also
[configure](howto/source.md#modules-nodejs)
and
[install](howto/source.md#source-bld-src-ext)
the **unit-http** module from sources.

To use Unit with multiple Node.js versions side by side,
we recommend
[Node Version Manager](https://github.com/nvm-sh/nvm):

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/:nxt_ph:`x.y.z <nvm version>`/install.sh | bash
```

Install the versions you need
and select the one you want to use with Unit:

```bash
$ nvm install 18
$ nvm install 16
$ nvm use 18
      Now using node :nxt_hint:`v18.12.1 <Note the version numbers>` (npm v8.19.2)
```

Having selected the specific version,
install the **node-gyp** module:

```bash
$ npm install -g node-gyp
```

Next, clone the Unit source code
to build a **unit-http** module
for the selected Node.js version:

```bash
$ hg clone https://hg.nginx.org/unit
$ cd unit
$ pwd
      :nxt_hint:`/home/user/unit <Note the path to the source code>`

$ ./configure
$ ./configure nodejs

      configuring nodejs module
      checking for node ... found
       + node version :nxt_hint:`v18.12.1 <Should be the version selected with nvm>`
      checking for npm ... found
       + npm version :nxt_hint:`8.19.2 <Should be the version selected with npm>`
      checking for node-gyp ... found
       + node-gyp version v9.3.0
```

Point to Unit’s header files and libraries in the source code directory
to build the module:

```bash
$ CPPFLAGS="-I/home/user/unit/include/" LDFLAGS="-L/home/user/unit/lib/"  \
      make node-install

$ npm list -g

      /home/vagrant/.nvm/versions/node/v18.12.1/lib
      ├── corepack@0.14.2
      ├── node-gyp@9.3.0
      ├── npm@8.19.2
      └── unit-http@1.29.0
```

That’s all;
use the newly built module to run your
[Node.js apps](configuration.md#configuration-nodejs)
on Unit as usual.

<a id="installation-precomp-startup"></a>

### Startup and shutdown

Enable Unit to launch automatically at system startup:

```bash
# systemctl enable unit
```

Start or restart Unit:

```bash
# systemctl restart unit
```

Stop a running Unit:

```bash
# systemctl stop unit
```

Disable Unit’s automatic startup:

```bash
# systemctl disable unit
```

Start Unit as a daemon:

```bash
# unitd
```

Stop all Unit’s processes:

```bash
# pkill unitd
```

For startup options, see
[below](howto/source.md#source-startup).

#### NOTE
Restarting Unit is necessary
after installing or uninstalling any language modules
to pick up the changes.

<a id="installation-community-repos"></a>

## Community Repositories

#### WARNING
These distributions are maintained by their respective communities,
not NGINX.
Use them with caution.

<!-- Legacy anchors are left here so that external links remain valid -->

<a id="installation-alpine-apk"></a>

<a id="installation-archlinux-aur"></a>

<a id="installation-scls"></a>

<a id="installation-freebsd-pkgs-prts"></a>

<a id="installation-gnt-prtg"></a>

<a id="installation-nix"></a>

<a id="installation-remirepo"></a>

To install Unit’s core executables
from the Alpine Linux
[packages](https://pkgs.alpinelinux.org/packages?name=unit*):

```bash
# apk update
# apk upgrade
# apk add unit
```

To install service manager files
and specific language modules:

```bash
# apk add unit-openrc unit-perl unit-php7 unit-python3 unit-ruby
# service unit restart  # Necessary for Unit to pick up any changes in language module setup
```

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/run/control.unit.sock**                                                                                                                                                                                                                                                                                                                            |
|------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit.log**                                                                                                                                                                                                                                                                                                                                 |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                                                                                                                                                                                                                                                                                                                                              |
| Startup and shutdown                                             | ```bash<br/># :nxt_hint:`service unit enable <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`service unit restart <Start or restart Unit; one-time action>`<br/># :nxt_hint:`service unit stop <Stop a running Unit; one-time action>`<br/># :nxt_hint:`service unit disable <Disable Unit's automatic startup>`<br/>``` |

To install Unit’s core executables
and specific language modules
from the Sisyphus
[packages](https://packages.altlinux.org/en/sisyphus/srpms/unit):

```bash
# apt-get update
# apt-get install unit
# apt-get install unit-perl unit-php unit-python3 unit-ruby
# service unit restart  # Necessary for Unit to pick up any changes in language module setup
```

Versions of these packages
with the **\*-debuginfo** suffix
contain symbols for
[debugging](troubleshooting.md#troubleshooting-core-dumps).

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/run/unit/control.sock**                                                                                                                                                                                                                                                                                                                            |
|------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**                                                                                                                                                                                                                                                                                                                            |
| Non-privileged [user and group](howto/security.md#security-apps) | **\_unit** (mind the **\_** prefix)                                                                                                                                                                                                                                                                                                                   |
| Startup and shutdown                                             | ```bash<br/># :nxt_hint:`service unit enable <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`service unit restart <Start or restart Unit; one-time action>`<br/># :nxt_hint:`service unit stop <Stop a running Unit; one-time action>`<br/># :nxt_hint:`service unit disable <Disable Unit's automatic startup>`<br/>``` |

To install Unit’s core executables and all language modules,
clone the
[Arch User Repository (AUR)](https://aur.archlinux.org/pkgbase/nginx-unit/):

```bash
$ git clone https://aur.archlinux.org/nginx-unit.git
$ cd nginx-unit
```

Before proceeding further,
verify that the **PKGBUILD** and the accompanying files
aren’t malicious or untrustworthy.
AUR packages are user produced without pre-moderation;
use them at your own risk.

Next, build the package:

```bash
$ makepkg -si
```

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/run/nginx-unit.control.sock**                                                                                                                                                                                                                                                                                                                              |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/nginx-unit.log**                                                                                                                                                                                                                                                                                                                                   |
| Non-privileged [user and group](howto/security.md#security-apps) | **nobody**                                                                                                                                                                                                                                                                                                                                                    |
| Startup and shutdown                                             | ```bash<br/># :nxt_hint:`systemctl enable unit <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`systemctl restart unit <Start or restart Unit; one-time action>`<br/># :nxt_hint:`systemctl stop unit <Stop a running Unit; one-time action>`<br/># :nxt_hint:`systemctl disable unit <Disable Unit's automatic startup>`<br/>``` |

To install Unit from
[FreeBSD packages](https://docs.freebsd.org/en/books/handbook/ports/#pkgng-intro),
get the core package and other packages you need:

```bash
# pkg install -y unit
# pkg install -y :nxt_hint:`libunit <Required to install the Node.js module>`
# pkg install -y unit-java8  \
                 unit-perl5.36  \
                 unit-php81 unit-php82 unit-php83  \
                 unit-python39  \
                 unit-ruby3.1  \
                 unit-wasm
# service unitd restart  # Necessary for Unit to pick up any changes in language module setup
```

To install Unit from
[FreeBSD ports](https://docs.freebsd.org/en/books/handbook/ports/#ports-using),
start by updating your port collection.

With **portsnap**:

```bash
# portsnap fetch update
```

With **git**:

```bash
# cd /usr/ports && git pull
```

Next, browse to the port path
to build and install the core Unit port:

```bash
# cd /usr/ports/www/unit/
# make
# make install
```

Repeat the steps for the other ports you need:
[libunit](https://www.freshports.org/devel/libunit/)
(required to install the Node.js
[module](#installation-nodejs-package)
and build
[Go apps](configuration.md#configuration-go)),
[unit-java](https://www.freshports.org/www/unit-java/),
[unit-perl](https://www.freshports.org/www/unit-perl/),
[unit-php](https://www.freshports.org/www/unit-php/),
[unit-python](https://www.freshports.org/www/unit-python/),
[unit-ruby](https://www.freshports.org/www/unit-ruby/),
or
[unit-wasm](https://www.freshports.org/www/unit-wasm/).
After that, restart Unit:

```bash
# service unitd restart  # Necessary for Unit to pick up any changes in language module setup
```

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/var/run/unit/control.unit.sock**                                                                                                                                                                                                                                                                                                                       |
|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**                                                                                                                                                                                                                                                                                                                                |
| Non-privileged [user and group](howto/security.md#security-apps) | **www**                                                                                                                                                                                                                                                                                                                                                   |
| Startup and shutdown                                             | ```bash<br/># :nxt_hint:`service unitd enable <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`service unitd restart <Start or restart Unit; one-time action>`<br/># :nxt_hint:`service unitd stop <Stop a running Unit; one-time action>`<br/># :nxt_hint:`service unitd disable <Disable Unit's automatic startup>`<br/>``` |

To install Unit using
[Portage](https://wiki.gentoo.org/wiki/Handbook:X86/Full/Portage),
update the repository
and install the
[package](https://packages.gentoo.org/packages/www-servers/nginx-unit):

```bash
# emerge --sync
# emerge www-servers/nginx-unit
```

To install specific language modules and features,
apply the corresponding
[USE flags](https://packages.gentoo.org/packages/www-servers/nginx-unit).

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/run/nginx-unit.sock**                                                                                                                                                                                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/nginx-unit**                                                                                                                                                                                                                                                                                                                                                          |
| Non-privileged [user and group](howto/security.md#security-apps) | **nobody**                                                                                                                                                                                                                                                                                                                                                                       |
| Startup and shutdown                                             | ```bash<br/># :nxt_hint:`rc-update add nginx-unit <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`rc-service nginx-unit restart <Start or restart Unit; one-time action>`<br/># :nxt_hint:`rc-service nginx-unit stop <Stop a running Unit; one-time action>`<br/># :nxt_hint:`rc-update del nginx-unit <Disable Unit's automatic startup>`<br/>``` |

To install Unit’s core package
and the other packages you need
from the
[NetBSD Packages Collection](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/www/unit/index.html):

```bash
# pkg_add unit
# pkg_add :nxt_hint:`libunit <Required to install the Node.js module>`
# pkg_add unit-perl  \
          unit-python2.7  \
          unit-python3.8 unit-python3.9 unit-python3.10 unit-python3.11 unit-python3.12  \
          unit-ruby31 unit-ruby32
# service unit restart  # Necessary for Unit to pick up any changes in language module setup
```

To build Unit manually,
start by updating the package collection:

```bash
# cd /usr/pkgsrc && cvs update -dP
```

Next, browse to the package path
to build and install the core Unit binaries:

```bash
# cd /usr/pkgsrc/www/unit/
# make build install
```

Repeat the steps for the other packages you need:
[libunit](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/devel/libunit/index.html)
(required to install the Node.js
[module](#installation-nodejs-package)
and build
[Go apps](configuration.md#configuration-go)),
[unit-perl](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/www/unit-perl/index.html),
[unit-php](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/www/unit-php/index.html),
[unit-python](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/www/unit-python/index.html),
or
[unit-ruby](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/www/unit-ruby/index.html).

Note that **unit-php** packages require the PHP package
to be built with the **php-embed** option.
To enable the option for **lang/php82**:

```bash
# echo "PKG_OPTIONS.php82=php-embed" >> /etc/mk.conf
```

After that, restart Unit:

```bash
# service unit restart  # Necessary for Unit to pick up any changes in language module setup
```

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/var/run/unit/control.unit.sock**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Startup and shutdown                                             | First, add Unit’s startup script<br/>to the **/etc/rc.d/** directory:<br/><br/>```bash<br/># cp /usr/pkg/share/examples/rc.d/unit /etc/rc.d/<br/>```<br/><br/>After that, you can start and stop Unit as follows:<br/><br/>```bash<br/># :nxt_hint:`service unit restart <Start or restart Unit; one-time action>`<br/># :nxt_hint:`service unit stop <Stop a running Unit; one-time action>`<br/>```<br/><br/>To enable or disable Unit’s automatic startup,<br/>edit **/etc/rc.conf**:<br/><br/>```ini<br/># Enable service:<br/>unit=YES<br/><br/># Disable service:<br/>unit=NO<br/>``` |

To install Unit’s core executables and all language modules
using the
[Nix](https://nixos.org)
package manager,
update the channel,
check if Unit’s available,
and install the
[package](https://github.com/NixOS/nixpkgs/tree/master/pkgs/servers/http/unit):

```bash
$ nix-channel --update
$ nix-env -qa 'unit'
$ nix-env -i unit
```

This installs most embedded language modules
and such features as SSL or IPv6 support.
For a full list of optionals,
see the
[package definition](https://github.com/NixOS/nixpkgs/blob/master/pkgs/servers/http/unit/default.nix);
for a **.nix** configuration file defining an app,
see
[this sample](https://github.com/NixOS/nixpkgs/blob/master/nixos/tests/web-servers/unit-php.nix).

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/run/unit/control.unit.sock**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Startup and shutdown                                             | Add **services.unit.enable = true;** to<br/>**/etc/nixos/configuration.nix**<br/>and rebuild the system configuration:<br/><br/>```bash<br/># nixos-rebuild switch<br/>```<br/><br/>After that, use **systemctl**:<br/><br/>```bash<br/># :nxt_hint:`systemctl enable unit <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`systemctl restart unit <Start or restart Unit; one-time action>`<br/># :nxt_hint:`systemctl stop unit <Stop a running Unit; one-time action>`<br/># :nxt_hint:`systemctl disable unit <Disable Unit's automatic startup>`<br/>``` |

To install Unit from
[OpenBSD packages](https://www.openbsd.org/faq/faq15.html),
get the core package and other packages you need:

```bash
# pkg_add unit
# pkg_add unit-perl
# pkg_add unit-php74
# pkg_add unit-php80
# pkg_add unit-php81
# pkg_add unit-php82
# pkg_add unit-php83
# pkg_add unit-python
# pkg_add unit-ruby
# rcctl restart unit  # Necessary for Unit to pick up any changes in language module setup
```

To install Unit from
[OpenBSD ports](https://pkgsrc.se/www/unit),
start by updating your port collection,
for example:

```bash
$ cd /usr/
$ cvs -d anoncvs@anoncvs.spacehopper.org:/cvs checkout -P ports
```

Next, browse to the port path to build and install Unit:

```bash
$ cd /usr/ports/www/unit/
$ make
# make install
```

This also installs the language modules for Perl, PHP, Python, and Ruby;
other modules can be built and installed from
[source](#source).
After that, restart Unit:

```bash
# rcctl restart unit  # Necessary for Unit to pick up any changes in language module setup
```

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/var/run/unit/control.unit.sock**                                                                                                                                                                                                                                                                                                           |
|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**                                                                                                                                                                                                                                                                                                                    |
| Non-privileged [user and group](howto/security.md#security-apps) | **\_unit**                                                                                                                                                                                                                                                                                                                                    |
| Startup and shutdown                                             | ```bash<br/># :nxt_hint:`rcctl enable unit <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`rcctl restart unit <Start or restart Unit; one-time action>`<br/># :nxt_hint:`rcctl stop unit <Stop a running Unit; one-time action>`<br/># :nxt_hint:`rcctl disable unit <Disable Unit's automatic startup>`<br/>``` |

[Remi’s RPM repository](https://blog.remirepo.net/post/2019/01/14/PHP-with-the-NGINX-unit-application-server),
which hosts the latest versions of the PHP stack
for Fedora and RHEL,
also has the core Unit package and the PHP modules.

To use Remi’s versions of Unit’s packages,
configure the
[repository](https://blog.remirepo.net/pages/Config-en)
first.
Remi’s PHP language modules are also compatible
with the core Unit package from
[our own
repository](#installation-precomp-pkgs).

Next, install Unit and the PHP modules you want:

```bash
# yum install --enablerepo=remi unit  \
      php54-unit-php php55-unit-php php56-unit-php  \
      php70-unit-php php71-unit-php php72-unit-php php73-unit-php php74-unit-php  \
      php80-unit-php php81-unit-php php82-unit-php
# systemctl restart unit  # Necessary for Unit to pick up any changes in language module setup
```

Runtime details:

| Control [socket](howto/source.md#source-startup)                 | **/run/unit/control.sock**                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | **/var/log/unit/unit.log**                                                                                                                                                                                                                                                                                                                                    |
| Non-privileged [user and group](howto/security.md#security-apps) | **nobody**                                                                                                                                                                                                                                                                                                                                                    |
| Startup and shutdown                                             | ```bash<br/># :nxt_hint:`systemctl enable unit <Enable Unit to launch automatically at system startup>`<br/># :nxt_hint:`systemctl restart unit <Start or restart Unit; one-time action>`<br/># :nxt_hint:`systemctl stop unit <Stop a running Unit; one-time action>`<br/># :nxt_hint:`systemctl disable unit <Disable Unit's automatic startup>`<br/>``` |

<a id="installation-docker"></a>

## Docker Images

Unit’s Docker images
come in several language-specific flavors:

| Tag                 | Description                                                                                                         |
|---------------------|---------------------------------------------------------------------------------------------------------------------|
| `1.32.1-minimal`    | No language modules;<br/>based on the **debian:bullseye-slim**<br/>[image](https://hub.docker.com/_/debian).        |
| `1.32.1-go1.21`     | Single-language;<br/>based on the **golang:1.21**<br/>[image](https://hub.docker.com/_/golang).                     |
| `1.32.1-jsc11`      | Single-language;<br/>based on the **eclipse-temurin:11-jdk**<br/>[image](https://hub.docker.com/_/eclipse-temurin). |
| `1.32.1-node20`     | Single-language;<br/>based on the **node:20**<br/>[image](https://hub.docker.com/_/node).                           |
| `1.32.1-perl5.38`   | Single-language;<br/>based on the **perl:5.38**<br/>[image](https://hub.docker.com/_/perl).                         |
| `1.32.1-php8.2`     | Single-language;<br/>based on the **php:8.2-cli**<br/>[image](https://hub.docker.com/_/php).                        |
| `1.32.1-python3.11` | Single-language;<br/>based on the **python:3.11**<br/>[image](https://hub.docker.com/_/python).                     |
| `1.32.1-ruby3.2`    | Single-language;<br/>based on the **ruby:3.2**<br/>[image](https://hub.docker.com/_/ruby).                          |
| `1.32.1-wasm`       | Single-language;<br/>based on the **debian:bullseye-slim**<br/>[image](https://hub.docker.com/_/debian).            |

To build a custom language version image,
clone and rebuild the sources locally
with Docker installed:

```bash
$ make build-<language name><language version> VERSIONS_<language name>=<language version>
```

The **make** utility parses the command line
to extract the language name and version;
these values must reference an existing official language image
to be used as the base for the build.
If not sure whether an official image exists
for a specific language version,
follow the links in the tag table above.

#### NOTE
Unit relies on the official Docker images,
so any customization method offered by their maintainers
is equally applicable;
to tailor a Unit image to your needs,
see the quick reference for its base image.

The language name can be
**go**, **jsc**, **node**, **perl**,
**php**, **python**, or **ruby**;
the version is defined as **<major>.<minor>**,
except for **jsc** and **node**
that take only major version numbers
(as seen in the tag table).
Thus, to create an image with Python 3.10
and tag it as **unit:|version|-python3.10**:

```bash
$ git clone https://github.com/nginx/unit
$ cd unit
$ git checkout 1.32.1  # Optional; use to choose a specific Unit version
$ cd pkg/docker/
$ make build-:nxt_ph:`python3.10 <Language name and version>` VERSIONS_:nxt_ph:`python <Language name>`=:nxt_ph:`3.10 <Language version>`
```

For details, see the
[Makefile](https://github.com/nginx/unit/blob/master/pkg/docker/Makefile).
For other customization scenarios, see the
[Docker howto](howto/docker.md).

Before Unit 1.29.1 was released,
our Docker images were available
from the official
[NGINX repository](https://hub.docker.com/r/nginx/unit/)
on Docker Hub.

Before Unit 1.22.0 was released,
the following tagging scheme was used:

> | Tag                      | Description                                                                        |
> |--------------------------|------------------------------------------------------------------------------------|
> | **<version>-full**       | Contains modules for all languages that Unit then supported.                       |
> | **<version>-minimal**    | No language modules were included.                                                 |
> | **<version>-<language>** | A specific language module<br/>such as **1.21.0-ruby2.3** or **1.21.0-python2.7**. |

You can obtain the images from these sources:

To install and run Unit from
[official builds](https://hub.docker.com/_/unit)
at Docker Hub:

```bash
$ docker pull unit::nxt_ph:`TAG <Specific image tag; see above for a complete list>`
$ docker run -d unit::nxt_ph:`TAG <Specific image tag; see above for a complete list>`
```

To install and run Unit from NGINX’s
[repository](https://gallery.ecr.aws/nginx/unit)
at Amazon ECR Public Gallery:

```bash
$ docker pull public.ecr.aws/nginx/unit::nxt_ph:`TAG <Specific image tag; see above for a complete list>`
$ docker run -d public.ecr.aws/nginx/unit::nxt_ph:`TAG <Specific image tag; see above for a complete list>`
```

#### WARNING
Unit’s 1.30+ image tarballs aren’t published on the website;
this channel is deprecated.

To install and run Unit
from the tarballs stored on our
[website](https://packages.nginx.org/unit/docker/):

```bash
$ curl -O https://packages.nginx.org/unit/docker/1.29.1/nginx-unit-:nxt_ph:`TAG <Specific image tag; see above for a complete list>`.tar.gz
$ curl -O https://packages.nginx.org/unit/docker/1.29.1/nginx-unit-:nxt_ph:`TAG <Specific image tag; see above for a complete list>`.tar.gz.sha512
$ sha512sum -c nginx-unit-:nxt_ph:`TAG <Specific image tag; see above for a complete list>`.tar.gz.sha512
      nginx-unit-:nxt_ph:`TAG <Specific image tag; see above for a complete list>`.tar.gz: OK

$ docker load < nginx-unit-:nxt_ph:`TAG <Specific image tag; see above for a complete list>`.tar.gz
```

Runtime details:

| Control [socket](howto/security.md#sec-socket)                   | **/var/run/control.unit.sock**                                                                  |
|------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| Log [file](troubleshooting.md#troubleshooting-log)               | Forwarded to the<br/>[Docker log collector](https://docs.docker.com/config/containers/logging/) |
| Non-privileged [user and group](howto/security.md#security-apps) | **unit**                                                                                        |

For more details,
see the repository pages
([Docker Hub](https://hub.docker.com/_/unit),
[Amazon ECR Public Gallery](https://gallery.ecr.aws/nginx/unit))
and our
[Docker howto](howto/docker.md).

<a id="installation-docker-init"></a>

### Initial configuration

The official images support initial container configuration,
implemented with an **ENTRYPOINT**
[script](https://docs.docker.com/engine/reference/builder/#entrypoint).
First, the script checks the Unit
[state directory](howto/source.md#source-config-src-state)
in the container
(**/var/lib/unit/**).
If it’s empty,
the script processes certain file types
in the container’s **/docker-entrypoint.d/** directory:

| File Type   | Purpose/Action                                                                                                                             |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **.pem**    | [Certificate bundles](certificates.md#configuration-ssl),<br/>uploaded under respective names:<br/>**cert.pem** to **/certificates/cert**. |
| **.json**   | [Configuration snippets](controlapi.md#configuration-mgmt), uploaded<br/>to the **/config** section of Unit’s configuration.               |
| **.sh**     | ,<br/>run after the **.pem** and **.json** files are uploaded;<br/>must be executable.                                                     |

The script warns about any other file types
in **/docker-entrypoint.d/**.

This mechanism enables
customizing your containers at startup,
reusing configurations,
and automating workflows to reduce manual effort.
To use the feature,
add **COPY** directives for certificate bundles,
configuration fragments,
and shell scripts
to your **Dockerfile** derived from an official image:

```docker
FROM unit:1.32.1-minimal
COPY ./*.pem  /docker-entrypoint.d/
COPY ./*.json /docker-entrypoint.d/
COPY ./*.sh   /docker-entrypoint.d/
```

#### NOTE
Mind that running Unit even once populates its state directory;
this prevents the script from executing,
so this script-based initialization must occur
before you run Unit in your derived container.

This feature comes in handy
if you want to tie Unit
to a certain app configuration for later use.
For ad-hoc initialization,
you can mount a directory with configuration files
to a container at startup:

```bash
$ docker run -d --mount  \
         type=bind,src=:nxt_ph:`/path/to/config/files/ <Use a real path instead>`,dst=/docker-entrypoint.d/  \
         unit:1.32.1-minimal)
```

<a id="source"></a>

## Source Code

You can get Unit’s source code
from our official GitHub repository
or as a tarball.

```bash
$ git clone https://github.com/nginx/unit            # Latest updates to the repository
$ # -- or --
$ git clone -b 1.32.1 https://github.com/nginx/unit  # Specific version tag; see https://github.com/nginx/unit/tags
$ cd unit
```

```bash
$ curl -O https://sources.nginx.org/unit/unit-1.32.1.tar.gz
$ tar xzf unit-1.32.1.tar.gz
$ cd unit-1.32.1
```

To build Unit and specific language modules from these sources,
refer to the
[source code howto](howto/source.md);
to package custom modules, see the
[module howto](howto/modules.md#modules-pkg).
