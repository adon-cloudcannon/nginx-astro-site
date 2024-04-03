# Building From Source

After you’ve obtained Unit’s [source code](../installation.md#source), configure
and compile it to fine-tune and run a custom Unit build.

<a id="source-prereq-build"></a>

## Installing Required Software

Before configuring and compiling Unit, install the required build tools and the
library files for the  and all other features you want in your
Unit, such as TLS or regular expressions.

The commands below assume you are configuring Unit with all supported languages
and features (**X**, **Y**, and **Z** denote major, minor, and
revision numbers, respectively); omit the packages you won’t use.

```console
# apt install build-essential
# apt install golang
# apt install curl && \
      curl -sL https://deb.nodesource.com/setup_:nxt_ph:`VERSION <Node.js 8.11 or later is supported>`.x | bash - && \
      apt install nodejs
# npm install -g node-gyp
# apt install php-dev libphp-embed
# apt install libperl-dev
# apt install python:nxt_ph:`X <Both Python 2 and Python 3 are supported>`-dev
# apt install ruby-dev ruby-rack
# apt install openjdk-:nxt_ph:`X <Java 8 or later is supported. Different JDKs may be used>`-jdk
# apt install libssl-dev
# apt install libpcre2-dev
```

```console
# yum install gcc make
# yum install golang
# yum install curl && \
      curl -sL https://rpm.nodesource.com/setup_:nxt_ph:`VERSION <Node.js 8.11 or later is supported>`.x | bash - && \
      yum install nodejs
# npm install -g node-gyp
# yum install php-devel php-embedded
# yum install perl-devel perl-libs
# yum install python:nxt_ph:`X <Both Python 2 and Python 3 are supported>`-devel
# yum install ruby-devel rubygem-rack
# yum install java-:nxt_ph:`X.Y.Z <Java 8 or later is supported. Different JDKs may be used>`-openjdk-devel
# yum install openssl-devel
# yum install pcre2-devel
```

Ports:

```console
# cd /usr/ports/lang/go/ && make install clean
# cd /usr/ports/www/node/ && make install clean
# cd /usr/ports/www/npm/ && make install clean && npm i -g node-gyp
# cd /usr/ports/lang/php:nxt_ph:`XY <PHP versions 5, 7, and 8 are supported>`/ && make install clean
# cd /usr/ports/lang/perl:nxt_ph:`X.Y <Perl 5.12 or later is supported>`/ && make install clean
# cd /usr/ports/lang/python/ && make install clean
# cd /usr/ports/lang/ruby:nxt_ph:`XY <Ruby 2.0 or later is supported>`/ && make install clean
# cd /usr/ports/java/openjdk:nxt_ph:`X <Java 8 or later is supported. Different JDKs may be used>`/ && make install clean
# cd /usr/ports/security/openssl/ && make install clean
# cd /usr/ports/devel/pcre2/ && make install clean
```

Packages:

```console
# pkg install go
# pkg install node && pkg install npm && npm i -g node-gyp
# pkg install php:nxt_ph:`XY <PHP versions 5, 7, and 8 are supported>`
# pkg install perl:nxt_ph:`X <Perl 5.12 or later is supported>`
# pkg install python
# pkg install ruby:nxt_ph:`XY <Ruby 2.0 is supported>`
# pkg install openjdk:nxt_ph:`X <Java 8 or later is supported. Different JDKs may be used>`
# pkg install openssl
# pkg install pcre2
```

```console
# pkg install gcc
# pkg install golang
# pkg install php-:nxt_ph:`XY <PHP versions 5, 7, and 8 are supported>`
# pkg install ruby
# pkg install jdk-:nxt_ph:`X <Java 8 or later is supported. Different JDKs may be used>`
# pkg install openssl
# pkg install pcre
```

Also, use **gmake** instead of **make** when [building
and installing](#source-bld-src) Unit on Solaris.

To build Unit with [njs](https://nginx.org/en/docs/njs/) support,
download the **njs** code
to the same parent directory
as the Unit code.

If you’d like to use [Mercurial](https://www.mercurial-scm.org/downloads):

```console
$ cd ..
$ hg clone https://hg.nginx.org/njs
```

If you prefer [Git](https://git-scm.com/downloads):

```console
$ cd ..
$ git clone https://github.com/nginx/njs
```

Next, configure and build the **njs** binaries:

```console
$ cd njs
$ ./configure :nxt_hint:`--no-zlib --no-libxml2 <Ensures Unit can link against the resulting library>` && make
```

Point to the resulting source and build directories when [configuring](#source-config-src-njs) the Unit code.

To build Unit with support for the WebAssembly Component Model,
you need **rust** version 1.76.0+, **cargo** and the developer
package for **clang** as mentioned in the
[Required Software Section](#source-prereq-build).

Next please refer to
[Configuring Modules - WebAssembly](#modules-webassembly) for
further instructions.

#### WARNING
The **unit-wasm** module is deprecated.
We recommend using **wasm-wasi-component** instead,
available in Unit 1.32.0 and later, which supports
WebAssembly Components using standard WASI 0.2 interfaces.

To build Unit with the [WebAssembly](https://webassembly.org)
language module,
you need the
[Wasmtime](https://wasmtime.dev)
runtime.
Download the C API
[files](https://github.com/bytecodealliance/wasmtime/releases/)
suitable for your OS and architecture
to the same parent directory
as the Unit code,
for example:

```console
$ cd ..
$ wget -O- https://github.com/bytecodealliance/wasmtime/releases/download/v12.0.0/wasmtime-v12.0.0-x86_64-linux-c-api.tar.xz \
      | tar Jxf -  # Unpacks to the current directory
```

Point to the resulting **include** and **lib** directories when
[configuring](#modules-webassembly) the Unit code.

To build WebAssembly apps that run on Unit, you need
the [wasi-sysroot](https://github.com/WebAssembly/wasi-sdk) SDK:

```console
$ wget -O- https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-20/wasi-sysroot-20.0.tar.gz | tar zxf -
```

When building the apps, add the following environment variable:

```console
WASI_SYSROOT=:nxt_ph:`/path/to/wasi-sysroot-dir/ <wasi-sysroot directory>`
```

<a id="source-config-src"></a>

## Configuring Sources

To run system compatibility checks and generate a **Makefile** with core
build instructions for Unit:

```console
$ ./configure :nxt_ph:`COMPILE-TIME OPTIONS <See the table below>`
```

Finalize the resulting **Makefile** by configuring the [language
modules](#source-modules) you need before proceeding further.

General options and settings that control compilation, runtime privileges,
or support for certain features:

| **--help**                                 | Displays a summary of common **./configure** options.<br/><br/>For language-specific details, run **./configure <language><br/>--help** or see [below](#source-modules).                                                                                                                                                                                                                      |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--cc=pathname**                          | Custom C compiler pathname.<br/><br/>The default is **cc**.                                                                                                                                                                                                                                                                                                                                   |
| **--cc-opt=options**, **--ld-opt=options** | Extra options for the C compiler and linker.                                                                                                                                                                                                                                                                                                                                                  |
| **--group=name**, **--user=name**          | Group name and username to run Unit’s non-privileged [processes](security.md#security-apps).<br/><br/>The defaults are `--user`’s primary group and<br/>**nobody**, respectively.                                                                                                                                                                                                             |
| **--debug**                                | Turns on the [debug log](../troubleshooting.md#troubleshooting-dbg-log).                                                                                                                                                                                                                                                                                                                      |
| **--no-ipv6**                              | Turns off IPv6 support.                                                                                                                                                                                                                                                                                                                                                                       |
| **--no-unix-sockets**                      | Turns off UNIX domain sockets support for control and routing.                                                                                                                                                                                                                                                                                                                                |
| **--openssl**                              | Turns on OpenSSL support.  Make sure OpenSSL (1.0.1+) header files and<br/>libraries are in your compiler’s path; it can be set with the<br/>`--cc-opt` and `--ld-opt` options or the<br/>`CFLAGS` and `LDFLAGS` environment variables when<br/>running **./configure**.<br/><br/>For details of TLS configuration in Unit, see [SSL/TLS certificates](../certificates.md#configuration-ssl). |

<a id="source-config-src-pcre"></a>

By default, Unit relies on the locally installed version of the [PCRE](https://www.pcre.org) library to support regular expressions in [routes](../configuration.md#configuration-routes); if both major versions are present, Unit selects
PCRE2.  Two additional options alter this behavior:

| **--no-regex**   | Turns off regex support; any attempts to use a regex in Unit<br/>configuration cause an error.   |
|------------------|--------------------------------------------------------------------------------------------------|
| **--no-pcre2**   | Ignores PCRE2; the older PCRE 8.x library is used instead.                                       |

<a id="source-config-src-njs"></a>

Unit also supports the use of [njs](https://nginx.org/en/docs/njs/) scripts
in configuration; to enable this feature, use the respective option:

| **--njs**   | Turns on **njs** support; requires **--openssl**.   |
|-------------|-----------------------------------------------------|

When `--njs` is enabled, the `--cc-opt` and
`--ld-opt` option values should point to the **src/**
and **build/** subdirectories of the **njs** source code.
For example, if you cloned the **njs** repo beside the Unit repo:

```console
$ ./configure --njs --openssl \
              --cc-opt="-I../njs/src/ -I../njs/build/"  \
              --ld-opt="-L../njs/build/"  \
              ...
```

The next option group customizes Unit’s runtime [directory
structure](#source-dir):

| **--prefix=PREFIX**                                | <a id="source-config-src-prefix"></a><br/><br/>Destination directory prefix for [path options](#source-dir):<br/>`--bindir`,<br/>`--sbindir`,<br/>`--includedir`,<br/>`--libdir`,<br/>`--modulesdir`,<br/>`--datarootdir`,<br/>`--mandir`,<br/>`--localstatedir`,<br/>`--libstatedir`,<br/>`--runstatedir`,<br/>`--logdir`,<br/>`--tmpdir`,<br/>`--control`,<br/>`--pid`,<br/>`--log`.<br/><br/>The default is **/usr/local**.                                                                                                                                                                                                                         |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--exec-prefix=EXEC_PREFIX**                      | Destination directory prefix for the executable directories only.<br/><br/>The default is the **PREFIX** value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **--bindir=BINDIR**, **--sbindir=SBINDIR**         | Directory paths for client and server executables.<br/><br/>The defaults are **EXEC_PREFIX/bin** and **EXEC_PREFIX/sbin**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **--includedir=INCLUDEDIR**, **--libdir=LIBDIR**   | Directory paths for **libunit** header files and libraries.<br/><br/>The defaults are **PREFIX/include** and **EXEC_PREFIX/lib**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **--modulesdir=MODULESDIR**                        | Directory path for Unit’s language [modules](modules.md).<br/><br/>The default is **LIBDIR/unit/modules**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **--datarootdir=DATAROOTDIR**, **--mandir=MANDIR** | Directory path for **unitd(8)** data storage and its subdirectory<br/>where the **man** page is installed.<br/><br/>The defaults are **PREFIX/share** and **DATAROOTDIR/man**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **--localstatedir=LOCALSTATEDIR**                  | Directory path where Unit stores its runtime state, PID file,<br/>control socket, and logs.<br/><br/>The default is **PREFIX/var**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **--libstatedir=LIBSTATEDIR**                      | <a id="source-config-src-state"></a><br/><br/>Directory path where Unit’s runtime state (configuration, certificates,<br/>other resources) is stored between runs.  If you migrate your<br/>installation, copy the entire directory.<br/><br/>#### WARNING<br/>The directory is sensitive and must be owned by **root** with<br/>**700** permissions.  Don’t change its contents externally; use<br/>the config API to ensure integrity.<br/><br/>The default is **LOCALSTATEDIR/run/unit**.                                                                                                                                                           |
| **--logdir=LOGDIR**, **--log=LOGFILE**             | Directory path and filename for Unit’s [log](../troubleshooting.md#troubleshooting-log).<br/><br/>The defaults are **LOCALSTATEDIR/log/unit** and<br/>**LOGDIR/unit.log**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **--runstatedir=RUNSTATEDIR**                      | Directory path where Unit stores its PID file and control socket.<br/><br/>The default is **LOCALSTATEDIR/run/unit**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **--pid=pathname**                                 | Pathname for the PID file of Unit’s **main** [process](security.md#security-apps).<br/><br/>The default is **RUNSTATEDIR/unit.pid**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **--control=SOCKET**                               | [Control API](../controlapi.md#configuration-mgmt) socket address in IPv4, IPv6,<br/>or UNIX domain format:<br/><br/>```console<br/>$ ./configure --control=127.0.0.1:8080<br/>$ ./configure --control=[::1]:8080<br/>$ ./configure --control=unix:/path/to/control.unit.sock  # Note the unix: prefix<br/>```<br/><br/>#### WARNING<br/>Avoid exposing an unprotected control socket in public networks.  Use<br/>[NGINX](integration.md#nginx-secure-api) or a different solution such as SSH<br/>for security and authentication.<br/><br/>The default is **unix:RUNSTATEDIR/control.unit.sock**, created as<br/>**root** with **600** permissions. |
| **--tmpdir=TMPDIR**                                | Defines the temporary file storage location (used to dump large request<br/>bodies).<br/><br/>The default value is **/tmp**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

<a id="source-dir"></a>

### Directory Structure

By default, **make install** installs Unit at the following pathnames:

| Directory             | Default Path                                       |
|-----------------------|----------------------------------------------------|
| **bin** directory     | **/usr/local/bin/**                                |
| **sbin** directory    | **/usr/local/sbin/**                               |
| **lib** directory     | **/usr/local/lib/**                                |
| **include** directory | **/usr/local/include/**                            |
| **tmp** directory     | **/tmp/**                                          |
| Man pages             | **/usr/local/share/man/**                          |
| Language modules      | **/usr/local/lib/unit/modules/**                   |
| Runtime state         | **/usr/local/var/lib/unit/**                       |
| PID file              | **/usr/local/var/run/unit/unit.pid**               |
| Log file              | **/usr/local/var/log/unit/unit.log**               |
| Control API socket    | **unix:/usr/local/var/run/unit/control.unit.sock** |

The defaults are designed to work for most cases; to customize this layout,
set the `--prefix` and its related options during [configuration](#source-config-src-prefix), defining the resulting file structure.

<a id="source-modules"></a>

## Configuring Modules

Next, configure a module for each language you want to use with Unit.  The
**./configure <language>** commands set up individual language modules
and place module-specific instructions in the **Makefile**.

#### NOTE
To run apps in several versions of a language, build and install a module
for each version.  To package custom modules, see the module [howto](modules.md#modules-pkg).

When you run **./configure go**, Unit sets up the Go package that
lets your applications [run on Unit](../configuration.md#configuration-go).  To use the
package, [install](#source-bld-src-ext) it in your Go environment.
Available configuration options:

| **--go=pathname**       | Specific Go executable pathname, also used in [make](#source-bld-src-ext) targets.<br/><br/>The default is **go**.   |
|-------------------------|----------------------------------------------------------------------------------------------------------------------|
| **--go-path=directory** | Custom directory path for Go package installation.<br/><br/>The default is **$GOPATH**.                              |

#### NOTE
Running **./configure go** doesn’t alter the `GOPATH`
[environment variable](https://github.com/golang/go/wiki/GOPATH), so
configure-time `--go-path` and compile-time `$GOPATH`
must be coherent for Go to find the resulting package.

```console
$ GOPATH=<Go package installation path> GO111MODULE=auto go build -o :nxt_ph:`app <Executable name>` :nxt_ph:`app.go <Application source code>`
```

When you run **./configure java**, the script configures a module
to support running [Java Web Applications](https://download.oracle.com/otndocs/jcp/servlet-3_1-fr-spec/index.html)
on Unit.  Available command options:

| **--home=directory**       | Directory path for Java utilities and header files to build the<br/>module.<br/><br/>The default is the **java.home** setting.            |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **--jars=directory**       | Directory path for Unit’s custom **.jar** files.<br/><br/>The default is the Java module path.                                            |
| **--lib-path=directory**   | Directory path for the **libjvm.so** library.<br/><br/>The default is based on JDK settings.                                              |
| **--local-repo=directory** | Directory path for the local **.jar** repository.<br/><br/>The default is **$HOME/.m2/repository/**.                                      |
| **--repo=directory**       | URL path for the remote Maven repository.<br/><br/>The default is **http://central.maven.org/maven2/**.                                   |
| **--module=basename**      | Resulting module’s name (**<basename>.unit.so**), also used<br/>in [make](#source-bld-src-emb) targets.<br/><br/>The default is **java**. |

To configure a module called **java11.unit.so** with OpenJDK 11.0.1:

```console
$ ./configure java --module=java11  \
                   --home=/Library/Java/JavaVirtualMachines/jdk-11.0.1.jdk/Contents/Home
```

When you run **./configure nodejs**, Unit sets up the
**unit-http** module that lets your applications [run on Unit](../configuration.md#configuration-nodejs).  Available configuration options:

| **--local=directory**   | Local directory path where the resulting module is installed.<br/><br/>By default, the module is installed globally [(recommended)](../installation.md#installation-nodejs-package).   |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--node=pathname**     | Specific Node.js executable pathname, also used in<br/>[make](#source-bld-src-ext) targets.<br/><br/>The default is **node**.                                                          |
| **--npm=pathname**      | Specific **npm** executable pathname.<br/><br/>The default is **npm**.                                                                                                                 |
| **--node-gyp=pathname** | Specific **node-gyp** executable pathname.<br/><br/>The default is **node-gyp**.                                                                                                       |

When you run **./configure perl**, the script configures a module
to support running Perl scripts as applications on Unit.  Available
command options:

| **--perl=pathname**   | Specific Perl executable pathname.<br/><br/>The default is **perl**.                                                                                                     |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--module=basename** | Resulting module’s name (**<basename>.unit.so**), also<br/>used in [make](#source-bld-src-emb) targets.<br/><br/>The default is the filename of the `--perl` executable. |

To configure a module called **perl-5.20.unit.so** for Perl 5.20.2:

```console
$ ./configure perl --module=perl-5.20  \
                   --perl=perl5.20.2
```

When you run **./configure php**, the script configures a custom
SAPI module linked with the **libphp** library to support running
PHP applications on Unit.  Available command options:

| **--config=pathname**    | Pathname of the **php-config** script used to set up<br/>the resulting module.<br/><br/>The default is **php-config**.                                                                                                                                |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--lib-path=directory** | Directory path of the **libphp** library file<br/>(**libphp\*.so** or **libphp\*.a**), usually available with<br/>an `--enable-embed` PHP build:<br/><br/>```console<br/>$ php-config --php-sapis<br/><br/>      ... embed ...<br/>```                |
| **--lib-static**         | Links the static **libphp** library (**libphp\*.a**)<br/>instead of the dynamic one (**libphp\*.so**); requires<br/>`--lib-path`.                                                                                                                     |
| **--module=basename**    | Resulting module’s name (**<basename>.unit.so**), also<br/>used in [make](#source-bld-src-emb) targets.<br/><br/>The default is `--config`’s filename minus the -config<br/>suffix; thus, **--config=/path/php7-config** yields<br/>**php7.unit.so**. |

To configure a module called **php70.unit.so** for PHP 7.0:

```console
$ ./configure php --module=php70  \
                  --config=/usr/lib64/php7.0/bin/php-config  \
                  --lib-path=/usr/lib64/php7.0/lib64
```

When you run **./configure python**, the script configures a
module to support running Python scripts as applications on Unit.
Available command options:

| **--config=pathname**    | Pathname of the **python-config** script used to<br/>set up the resulting module.<br/><br/>The default is **python-config**.                                                                                                                   |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--lib-path=directory** | Custom directory path of the Python runtime library to use with<br/>Unit.                                                                                                                                                                      |
| **--module=basename**    | Resulting module’s name (**<basename>.unit.so**), also<br/>used in [make](#source-bld-src-emb) targets.<br/><br/>The default is `--config`’s filename minus the -config<br/>suffix; thus, **/path/python3-config** turns into<br/>**python3**. |

#### NOTE
The Python interpreter set by **python-config** must be
compiled with the `--enable-shared` [option](https://docs.python.org/3/using/configure.html#linker-options).

To configure a module called **py33.unit.so** for Python 3.3:

```console
$ ./configure python --module=py33  \
                     --config=python-config-3.3
```

When you run **./configure ruby**, the script configures a module
to support running Ruby scripts as applications on Unit.  Available
command options:

| **--module=basename**   | Resulting module’s name (**<basename>.unit.so**), also<br/>used in [make](#source-bld-src-emb) targets.<br/><br/>The default is the filename of the `--ruby` executable.   |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--ruby=pathname**     | Specific Ruby executable pathname.<br/><br/>The default is **ruby**.                                                                                                       |

To configure a module called **ru23.unit.so** for Ruby 2.3:

```console
$ ./configure ruby --module=ru23  \
                   --ruby=ruby23
```

<a id="modules-webassembly"></a>

When you run **./configure wasm-wasi-component**,
the script configures a module to support running WebAssembly
components on Unit.

The module doesn’t accept any extra configuration parameters.
The module’s basename is wasm-wasi-component.

#### WARNING
Unit 1.32.0 and later support the WebAssembly Component Model and WASI
0.2 APIs.
We recommend using the new implementation.

When you run **./configure wasm**, the script configures a module
to support running WebAssembly applications on Unit.
Available command options:

| **--module=basename**   | Resulting module’s name (**<basename>.unit.so**), also<br/>used in [make](#source-bld-src-emb) targets.                                               |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--runtime=basename**  | The WebAssembly runtime to use.<br/><br/>The default is **wasmtime**.                                                                                 |
| **--include-path=path** | The directory path to the runtime’s header files.                                                                                                     |
| **--lib-path=path**     | The directory path to the runtime’s library files.                                                                                                    |
| **--rpath=<path>**      | The directory path that designates the run-time library search<br/>path.<br/><br/>If specified without a value,<br/>assumes the **--lib-path** value. |

To configure a module called **wasm.unit.so**:

```console
$ ./configure wasm --include-path=:nxt_ph:`/path/to/wasmtime <Runtime's header directory>`/include  \
                   --lib-path=:nxt_ph:`/path/to/wasmtime <Runtime's library directory>`/lib \
                   --rpath
```

<a id="source-bld-src"></a>

## Building and Installing Unit

To build and install Unit’s executables and language modules that you have
**./configure**’d earlier:

```console
$ make
# make install
```

Mind that **make install** requires setting up Unit’s [directory
structure](#source-dir) with **./configure** first.

To run Unit from the build directory tree without installing:

```console
$ ./configure --prefix=./build
$ make
$ ./build/sbin/unitd
```

You can also build and install language modules individually; the specific
method depends on whether the language module is embedded in Unit (Java, Perl,
PHP, Python, Ruby) or packaged externally (Go, Node.js).

#### NOTE
For further details about Unit’s language modules, see [Working With Language Modules](modules.md).

<a id="source-bld-src-emb"></a>

### Embedded Language Modules

To build and install the modules for Java, PHP, Perl, Python, or Ruby after
configuration, run **make <module basename>** and **make
<module basename>-install**, for example:

```console
$ make :nxt_hint:`perl-5.20 <This is the --module option value from ./configure perl>`
# make :nxt_hint:`perl-5.20 <This is the --module option value from ./configure perl>`-install
```

<a id="source-bld-src-ext"></a>

### External Language Modules

To build and install the modules for Go and Node.js globally after
configuration, run **make <go>-install** and **make
<node>-install**, for example:

```console
# make :nxt_hint:`go <This is the --go option value from ./configure go>`-install
# make :nxt_hint:`node <This is the --node option value from ./configure nodejs>`-install
```

#### NOTE
To install the Node.js module locally, run **make
<node>-local-install**:

```console
# make :nxt_hint:`node <This is the --node option value from ./configure nodejs>`-local-install
```

If you haven’t specified the `--local` [directory](#modules-nodejs) with **./configure nodejs**
earlier, provide it here:

```console
# DESTDIR=/your/project/directory/ make node-local-install
```

If both options are specified, `DESTDIR` prefixes the
`--local` value set by **./configure nodejs**.

Finally, mind that global installation is preferable for the Node.js module.

If you customized the executable pathname with `--go` or
`--node`, use the following pattern:

```console
$ ./configure nodejs --node=:nxt_hint:`/usr/local/bin/node8.12 <Executable pathname>`
# make :nxt_hint:`/usr/local/bin/node8.12 <Executable pathname becomes a part of the target>`-install

$ ./configure go --go=:nxt_hint:`/usr/local/bin/go1.7 <Executable pathname>`
# make :nxt_hint:`/usr/local/bin/go1.7 <Executable pathname becomes a part of the target>`-install
```

<a id="source-startup"></a>

## Startup and Shutdown

#### WARNING
We advise installing Unit from [precompiled packages](../installation.md#installation-precomp-pkgs); in this case, startup is [configured](../installation.md#installation-precomp-startup) automatically.

Even if you install Unit otherwise, avoid manual startup.  Instead,
configure a service manager (**OpenRC**, **systemd**, and so
on) or create an **rc.d** script to launch the Unit daemon using the
options below.

The startup command depends on the directories you set with
**./configure**, but their default values place the **unitd**
binary in a well-known place, so:

```console
# :nxt_hint:`unitd <Your PATH environment variable should list a path to unitd>` :nxt_ph:`RUNTIME OPTIONS <See the table below>`
```

Run **unitd -h** or **unitd --version** to list Unit’s
compile-time settings.  Usually, the defaults don’t require overrides; still,
the following runtime options are available.  For their compile-time
counterparts, see [here](#source-config-src).

| **--help**, **-h**                | Displays a summary of the command-line options and their defaults.                                                                                                                                                                                           |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **--version**                     | Displays Unit’s version and the **./configure** settings it was<br/>built with.                                                                                                                                                                              |
| **--no-daemon**                   | Runs Unit in non-daemon mode.                                                                                                                                                                                                                                |
| **--control socket**              | Control API socket address in IPv4, IPv6, or UNIX domain format:<br/><br/>```console<br/># unitd --control 127.0.0.1:8080<br/># unitd --control [::1]:8080<br/># unitd --control :nxt_hint:`unix:/path/to/control.unit.sock <Note the unix: prefix>`<br/>``` |
| **--control-mode**                | Sets the permission of the UNIX domain control socket. Default: 0600                                                                                                                                                                                         |
| **--control-user**                | Sets the owner of the UNIX domain control socket.                                                                                                                                                                                                            |
| **--control-group**               | Sets the group of the UNIX domain control socket.                                                                                                                                                                                                            |
| **--group name**, **--user name** | Group name and user name used to run Unit’s non-privileged<br/>[processes](security.md#security-apps).                                                                                                                                                       |
| **--log pathname**                | Pathname for Unit’s [log](../troubleshooting.md#troubleshooting-log).                                                                                                                                                                                        |
| **--modules directory**           | Directory path for Unit’s language [modules](modules.md)<br/>(**\*.unit.so** files).                                                                                                                                                                         |
| **--pid pathname**                | Pathname for the PID file of Unit’s **main** [process](security.md#security-apps).                                                                                                                                                                           |
| **--state directory**             | Directory path for Unit’s state storage.                                                                                                                                                                                                                     |
| **--tmp directory**               | Directory path for Unit’s temporary file storage.                                                                                                                                                                                                            |

Finally, to stop a running Unit:

```console
# pkill unitd
```

This command signals all Unit’s processes to terminate in a graceful manner.
