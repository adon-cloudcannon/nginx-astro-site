---
layout: "@layouts/BaseLayout.astro"
title: Mercurial
---
# Mercurial

To install and run the [Mercurial](https://www.mercurial-scm.org) source
control system using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python language module.
2. Install Mercurial’s [core files](https://www.mercurial-scm.org/wiki/UnixInstall).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.
3. Optionally, configure a [repository](https://www.mercurial-scm.org/wiki/TutorialInit) or choose an existing
   one, noting its directory path.
4. Unit [uses WSGI](../configuration.md#configuration-python) to run Python apps, so it
   requires a [wrapper](https://www.mercurial-scm.org/repo/hg/file/default/contrib/hgweb.wsgi)
   script to publish a Mercurial repo.  Here, it’s **/path/to/app/hgweb.py**
   (note the extension); the **application** callable is the entry
   point:
   > ```python
   > from mercurial.hgweb import hgweb

   > # path to a repo or a hgweb config file to serve in UTF-8 (see 'hg help hgweb')
   > application = hgweb(":nxt_ph:`/path/to/app/repo/or/config/file <Replace with a real path in your configuration>`".encode("utf-8"))
   > ```

   This is a very basic script; to elaborate on it, see the
   Mercurial repo publishing [guide](https://www.mercurial-scm.org/wiki/PublishingRepositories#hgweb).
5. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
6. Next, prepare the Mercurial [configuration](../configuration.md#configuration-python) for Unit (use a real value for **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/hg"
           }
       },

       "applications": {
           "hg": {
               "type": "python",
               "path": ":nxt_ph:`/path/to/app/ <Path to the WSGI file referenced by the module option; use a real path in your configuration>`",
               "module": ":nxt_hint:`hgweb <WSGI module basename with extension omitted>`"
           }
       }
   }
   ```
7. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, you can proceed to work with your Mercurial
   repository as usual:
   ```console
   $ hg config --edit
   $ hg clone http://localhost/ project/
   $ cd project/
   $ touch hg_rocks.txt
   $ hg add
   $ hg commit -m 'Official: Mercurial on Unit rocks!'
   $ hg push
   ```

   ![Mercurial on Unit - Changeset Screen](/hg.png)
