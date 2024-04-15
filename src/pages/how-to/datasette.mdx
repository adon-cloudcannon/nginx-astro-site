---
layout: "@layouts/BaseLayout.astro"
title: Datasette
---
# Datasette

To run the [Datasette](https://docs.datasette.io/en/stable/) data exploration tool using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.6+ language module.
2. Create a virtual environment to install Datasette’s [PIP package](https://docs.datasette.io/en/stable/installation.html#using-pip):
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python3 --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`3.Y.Z <Major version, minor version, and revision number>`
   $ python3 -m venv :nxt_hint:`venv <Arbitrary name of the virtual environment>`
   $ source :nxt_hint:`venv <Name of the virtual environment from the previous command>`/bin/activate
   $ pip install datasette
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches the
   language module from Step 1 up to the minor number (**3.Y** in this
   example).  Also, the app **type** in Step 5 must [resolve](../configuration.md#configuration-apps-common) to a similarly matching version; Unit doesn’t
   infer it from the environment.
3. Running Datasette on Unit requires a wrapper to expose the [application object](https://github.com/simonw/datasette/blob/4f7c0ebd85ccd8c1853d7aa0147628f7c1b749cc/datasette/app.py#L169)
   as the ASGI callable. Let’s use the following basic version, saving it as
   **/path/to/app/asgi.py**:
   ```python
   import glob
   from datasette.app import Datasette

   application = Datasette(glob.glob('*.db')).app()
   ```
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-python) the Datasette configuration for
   Unit (use real values for **type**, **home**, and **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/datasette"
           }
       },

       "applications": {
           "datasette": {
               "type": "python 3.:nxt_ph:`Y <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Path to the ASGI module>`",
               "home": ":nxt_ph:`/path/to/app/venv/ <Path to the virtual environment, if any>`",
               "module": ":nxt_hint:`asgi <ASGI module filename with extension omitted>`",
               "callable": ":nxt_hint:`app <Name of the callable in the module to run>`"
           }
       }
   }
   ```
6. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, Datasette should be available on the listener’s IP
   address and port:
   ![Datasette on Unit - Query Screen](/datasette.png)
