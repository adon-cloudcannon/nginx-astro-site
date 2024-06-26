---
layout: "@layouts/BaseLayout.astro"
title: Working With Language Modules
---
# Working With Language Modules

Languages supported by Unit fall into these two categories:

- [External](#modules-ext) (Go, Node.js): Run outside Unit with an
  interface layer to the native runtime.
- [Embedded](#modules-emb) (Java, Perl, PHP, Python, Ruby, WebAssembly):
  Execute in runtimes that Unit loads at startup.

For any specific language and its version, Unit needs a language module.

<a id="modules-ext"></a>

## External Language Modules

External modules are regular language libraries or packages that you install
like any other.  They provide common web functionality, communicating with Unit
from the app’s runspace.

In Go, Unit support is implemented with a package that you [import](../configuration.md#configuration-go) in your apps to make them Unit-aware.

In Node.js, Unit is supported by an **npm**-hosted [package](https://www.npmjs.com/package/unit-http) that you [require](../configuration.md#configuration-nodejs) in your app code.  You can [install](../installation.md#installation-nodejs-package) the package from the **npm** repository;
otherwise, [build](source.md#modules-nodejs) it for your version of
Node.js using Unit’s sources.

For WebAssembly, Unit delegates bytecode execution to the
[Wasmtime](https://wasmtime.dev/)
runtime that is installed with the
[language module](../installation.md#installation-precomp-pkgs)
module or during
a [source build](source.md#source-wasm).

<a id="modules-emb"></a>

## Embedded Language Modules

Embedded modules are shared libraries that Unit loads at startup.  Query Unit
to find them in your system:

```bash
$ unitd -h

       ...
      --log FILE           set log filename
                           default: ":nxt_ph:`/default/path/to/unit.log <This is the default log path which can be overridden at runtime>`"

      --modules DIRECTORY  set modules directory name
                           default: ":nxt_ph:`/default/modules/path/ <This is the default modules path which can be overridden at runtime>`"

$ :nxt_hint:`ps ax | grep unitd <Check whether the defaults were overridden at launch>`
      ...
      unit: main v1.32.1 [unitd --log :nxt_ph:`/runtime/path/to/unit.log <If this option is set, its value is used at runtime>` --modules :nxt_ph:`/runtime/modules/path/ <If this option is set, its value is used at runtime>` ... ]

$ ls :nxt_ph:`/path/to/modules <Use runtime value if the default was overridden>`

      java.unit.so  php.unit.so     ruby.unit.so  wasm_wasi_component.unit.so
      perl.unit.so  python.unit.so  wasm.unit.so
```

To clarify the module versions, check the [Unit log](../troubleshooting.md#troubleshooting-log)
to see which modules were loaded at startup:

```bash
# less :nxt_ph:`/path/to/unit.log <Path to log can be determined in the same manner as above>`
      ...
      discovery started
      module: <language> <version> "/path/to/modules/<module name>.unit.so"
      ...
```

If a language version is not listed, Unit can’t run apps that rely on it;
however, you can add new modules:

- If possible, use the official [language packages](../installation.md#installation-precomp-pkgs) for easy integration and maintenance.
- If you installed Unit via a [third-party repo](../installation.md#installation-community-repos), check whether a suitable language package is
  available there.
- If you want a customized yet reusable solution, [prepare](#modules-pkg)
  your own package to be installed beside Unit.

<a id="modules-pkg"></a>

### Packaging Custom Modules

There’s always a chance that you need to run a language version that isn’t yet
available among the official Unit [packages](../installation.md#installation-precomp-pkgs)
but still want to benefit from the convenience of a packaged installation.  In
this case, you can build your own package to be installed alongside the
official distribution, adding the latter as a prerequisite.

Here, we are packaging a custom PHP 7.3 [module](source.md#modules-php) to be installed next to the official Unit package;
adjust the command samples as needed to fit your scenario.

#### NOTE
For details of building Unit language modules, see the source code
[howto](source.md#source-modules); it also describes building
[Unit](source.md) itself.  For more packaging examples, see our package
[sources](https://hg.nginx.org/unit/file/tip/pkg/).

<!-- Legacy anchors to preserve existing external links. -->

<a id="modules-deb"></a>

<a id="modules-rpm"></a>

Assuming you are packaging for the current system and have the official
Unit package installed:

1. Make sure to install the [prerequisites](source.md#source-prereq-build) for the package.  In our example,
   it’s PHP 7.3 on Debian 10:
   ```bash
   # apt update
   # apt install :nxt_hint:`ca-certificates apt-transport-https debian-archive-keyring <Needed to install the php7.3 package from the PHP repo>`
   # curl --output /usr/share/keyrings/php-keyring.gpg  \
         :nxt_hint:`https://packages.sury.org/php/apt.gpg <Adding the repo key to make it usable>`
   # echo "deb [signed-by=/usr/share/keyrings/php-keyring.gpg]  \
         https://packages.sury.org/php/ buster main" > /etc/apt/sources.list.d/php.list
   # apt update
   # apt install php7.3
   # apt install :nxt_hint:`php-dev libphp-embed <Needed to build the module and the package>`
   ```
2. Create a staging directory for your package:
   ```bash
   $ export UNITTMP=$(mktemp -d -p /tmp -t unit.XXXXXX)
   $ mkdir -p $UNITTMP/unit-php7.3/DEBIAN
   $ cd $UNITTMP
   ```

   This creates a folder structure fit for **dpkg-deb**; the
   **DEBIAN** folder will store the package definition.
3. Run **unitd --version** and note the **./configure**
   [flags](source.md#source-config-src) for later use, omitting
   `--ld-opt` and `--njs`:
   ```bash
   $ unitd --version

       unit version: 1.32.1
       configured as ./configure :nxt_ph:`FLAGS <Note the flags, omitting --ld-opt and --njs>`
   ```
4. Download Unit’s sources, [configure](source.md#source-modules)
   and build your custom module, then put it where Unit will find it:
   ```bash
   $ curl -O https://sources.nginx.org/unit/unit-1.32.1.tar.gz
   $ tar xzf unit-1.32.1.tar.gz                                 # Puts Unit's sources in the unit-1.32.1 subdirectory
   $ cd unit-1.32.1
   $ ./configure :nxt_ph:`FLAGS W/O --LD-OPT & --NJS <The ./configure flags, except for --ld-opt and --njs>`                     # Use the ./configure flags noted in the previous step
   $ ./configure php --module=php7.3 --config=php-config        # Configures the module itself
   $ make php7.3                                                # Builds the module in the build/ subdirectory
   $ mkdir -p $UNITTMP/unit-php7.3/:nxt_ph:`MODULESPATH <Path to Unit's language modules>`                  # Use the module path set by ./configure or by default
   $ mv build/php7.3.unit.so $UNITTMP/unit-php7.3/:nxt_ph:`MODULESPATH <Path to Unit's language modules>`   # Adds the module to the package
   ```
5. Create a **$UNITTMP/unit-php7.3/DEBIAN/control** [file](https://www.debian.org/doc/debian-policy/ch-controlfields.html),
   listing **unit** with other dependencies:
   ```control
   Package: unit-php7.3
   Version: 1.32.1
   Comment0: Use Unit's package version for consistency: 'apt show unit | grep Version'
   Architecture: amd64
   Comment1: To get current architecture, run 'dpkg --print-architecture'
   Comment2: For a list of other options, run 'dpkg-architecture -L'
   Depends: unit (= 1.32.1-1~buster), php7.3, libphp-embed
   Comment3: Specify Unit's package version to avoid issues when Unit updates
   Comment4: Again, run 'apt show unit | grep Version' to get this value
   Maintainer: Jane Doe <j.doe@example.com>
   Description: Custom PHP 7.3 language module for NGINX Unit 1.32.1
   ```

   Save and close the file.
6. Build and install the package:
   ```bash
   $ dpkg-deb -b $UNITTMP/unit-php7.3
   # dpkg -i $UNITTMP/unit-php7.3.deb
   ```

Assuming you are packaging for the current system and have the official
Unit package installed:

1. Make sure to install the [prerequisites](source.md#source-prereq-build) for the package.  In our example,
   it’s PHP 7.3 on Fedora 30:
   ```bash
   # yum install -y php-7.3.8
   # yum install php-devel php-embedded
   ```
2. Install RPM development tools and prepare the directory structure:
   ```bash
   # yum install -y rpmdevtools
   $ rpmdev-setuptree
   ```
3. Create a **.spec** [file](https://rpm-packaging-guide.github.io/#what-is-a-spec-file)
   to store build commands for your custom package:
   ```bash
   $ cd ~/rpmbuild/SPECS
   $ rpmdev-newspec unit-php7.3
   ```
4. Run **unitd --version** and note the **./configure**
   [flags](source.md#source-config-src) for later use, omitting
   `--ld-opt` and `--njs`:
   ```bash
   $ unitd --version

       unit version: 1.32.1
       configured as ./configure :nxt_ph:`FLAGS <Note the flags, omitting --ld-opt and --njs>`
   ```
5. Edit the **unit-php7.3.spec** file, adding the commands that
   download Unit’s sources, [configure](source.md#source-modules) and build your custom module, then
   put it where Unit will find it:
   ```spec
   Name:           unit-php7.3
   Version:        1.32.1
   # Use Unit's package version for consistency: 'yum info unit | grep Version'
   Release:        1%{?dist}
   Summary:        Custom language module for NGINX Unit

   License:        ASL 2.0
   # Unit uses ASL 2.0; your license depends on the language you are packaging
   URL:            https://example.com
   BuildRequires:  gcc
   BuildRequires:  make
   BuildRequires:  php-devel
   BuildRequires:  php-embedded
   Requires:       unit = 1.32.1
   # Specify Unit's package version to avoid issues when Unit updates
   # Again, run 'yum info unit | grep Version' to get this value
   Requires:       php >= 7.3
   Requires:       php-embedded

   %description
   Custom language module for NGINX Unit 1.32.1 (https://unit.nginx.org).

   Maintainer: Jane Doe <j.doe@example.com>

   %prep
   curl -O https://sources.nginx.org/unit/unit-1.32.1.tar.gz
   # Downloads Unit's sources
   tar --strip-components=1 -xzf unit-1.32.1.tar.gz
   # Extracts them locally for compilation steps in the %build section

   %build
   ./configure :nxt_ph:`FLAGS W/O --LD-OPT & --NJS <The ./configure flags, except for --ld-opt and --njs>`
   # Configures the build; use the ./configure flags noted in the previous step
   ./configure php --module=php7.3 --config=php-config
   # Configures the module itself
   make php7.3
   # Builds the module

   %install
   DESTDIR=%{buildroot} make php7.3-install
   # Adds the module to the package

   %files
   %attr(0755, root, root) ":nxt_ph:`MODULESPATH <Path to Unit's language modules>`/php7.3.unit.so"
   # Lists the module as package contents to include it in the package build
   # Use the module path set by ./configure or by default
   ```

   Save and close the file.
6. Build and install the package:
   ```bash
   $ rpmbuild -bb unit-php7.3.spec

       ...
       Wrote: /home/user/rpmbuild/RPMS/<arch>/unit-php7.3-<moduleversion>.<arch>.rpm
       ...

   # yum install -y /home/user/rpmbuild/RPMS/<arch>/unit-php7.3-<moduleversion>.<arch>.rpm
   ```
