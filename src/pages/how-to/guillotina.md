---
layout: "@layouts/BaseLayout.astro"
title: Guillotina
---
# Guillotina

To run apps built with the [Guillotina](https://guillotina.readthedocs.io/en/latest/) web framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.7+ language module.
2. Create a virtual environment to install Guillotina’s [PIP package](https://guillotina.readthedocs.io/en/latest/training/installation.html):
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python3 --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`3.Y.Z <Major version, minor version, and revision number>`
   $ python3 -m venv :nxt_hint:`venv <Arbitrary name of the virtual environment>`
   $ source :nxt_hint:`venv <Name of the virtual environment from the previous command>`/bin/activate
   $ pip install guillotina
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches the
   language module from Step 1 up to the minor number (**3.Y** in this
   example).  Also, the app **type** in Step 5 must [resolve](../configuration.md#configuration-apps-common) to a similarly matching version; Unit doesn’t
   infer it from the environment.
3. Let’s try a version of the [tutorial app](https://guillotina.readthedocs.io/en/latest/#build-a-guillotina-app),
   saving it as **/path/to/app/asgi.py**:
   ```python
   from guillotina import configure
   from guillotina import content
   from guillotina import schema
   from guillotina.factory import make_app
   from zope import interface


   class IMyType(interface.Interface):
       textline = schema.TextLine()


   @configure.contenttype(
       type_name="MyType",
       schema=IMyType,
       behaviors=["guillotina.behaviors.dublincore.IDublinCore"],
   )
   class MyType(content.Resource):
       pass


   @configure.service(
       context=IMyType,
       method="GET",
       permission="guillotina.ViewContent",
       name="@textline",
   )
   async def textline_service(context, request):
       return {"textline": context.textline}


   :nxt_hint:`application <Callable name that Unit looks for>` = make_app(
           settings={
               "applications": ["__main__"],
               "root_user": {"password": "root"},
               "databases": {
                   "db": {"storage": "DUMMY_FILE", "filename": "dummy_file.db",}
               },
           }
       )
   ```

   Note that all server calls and imports are removed.
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-python) the Guillotina configuration for
   Unit (use real values for **type**, **home**, and **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/guillotina"
           }
       },

       "applications": {
           "guillotina": {
               "type": "python 3.:nxt_ph:`Y <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Path to the ASGI module>`",
               "home": ":nxt_ph:`/path/to/app/venv/ <Path to the virtual environment, if any>`",
               "module": ":nxt_hint:`asgi <ASGI module filename with extension omitted>`",
               "protocol": ":nxt_hint:`asgi <Protocol hint for Unit, required to run Guillotina apps>`"
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

   After a successful update, your app should be available on the listener’s IP
   address and port:
   ```bash
   $ curl -XPOST --user root:root http://localhost/db \
          -d '{ "@type": "Container", "id": "container" }'

         {"@type":"Container","id":"container","title":"container"}

   $ curl --user root:root http://localhost/db/container

         {
             "@id": "http://localhost/db/container",
             "@type": "Container",
             "@name": "container",
             "@uid": "84651300b2f14170b2b2e4a0f004b1a3",
             "@static_behaviors": [
             ],
             "parent": {
             },
             "is_folderish": true,
             "creation_date": "2020-10-16T14:07:35.002780+00:00",
             "modification_date": "2020-10-16T14:07:35.002780+00:00",
             "type_name": "Container",
             "title": "container",
             "uuid": "84651300b2f14170b2b2e4a0f004b1a3",
             "__behaviors__": [
             ],
             "items": [
             ],
             "length": 0
         }
   ```
