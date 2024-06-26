---
layout: "@layouts/BaseLayout.astro"
title: Unit in Ansible
---
# Unit in Ansible

The [Ansible collection](https://galaxy.ansible.com/steampunk/unit) by [XLAB
Steampunk](https://steampunk.si) provides a number of Unit-related tasks
that you can use with Ansible; some of them simplify installation and setup,
while others provide common configuration steps.

#### NOTE
Ansible 2.9+ required; the collection relies on official packages and
supports Debian only.

A brief intro by the collection’s authors can be found [here](https://docs.steampunk.si/unit/quickstart.html); a behind-the-scenes
blog post is [here](https://steampunk.si/blog/why-and-how-of-the-nginx-unit-ansible-collection/).

First, install the collection:

```bash
$ ansible-galaxy collection install steampunk.unit
```

After installation, you can use it in a playbook.  Consider this [WSGI app](../configuration.md#configuration-python):

```python
def application(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return (b"Hello, Python on Unit!")
```

This [playbook](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html)
installs Unit with the Python language module, copies the app’s file, and runs
the app:

```yaml
---
- name: Install and run NGINX Unit
  hosts: unit_hosts
  become: true

  tasks:
    - name: Install Unit
      include_role:
        name: steampunk.unit.install

    - name: Create a directory for our application
      file:
        path: :nxt_hint:`/var/www <Directory where the app will be stored on the host>`
        state: directory

    - name: Copy application
      copy:
        src: :nxt_hint:`files/wsgi.py <Note that the application's code is copied from a subdirectory>`
        dest: :nxt_hint:`/var/www/wsgi.py <Filename on the host>`
        mode: "644"

    - name: Add application config to Unit
      :nxt_hint:`steampunk.unit.python_app <Task that configures a Python app in Unit>`:
        name: :nxt_hint:`sample <Becomes the application's name in the configuration>`
        module: :nxt_hint:`wsgi <Goes straight to 'module' in the application's configuration>`
        path: :nxt_hint:`/var/www <Again, goes straight to the application's configuration>`

    - name: Expose application via port 3000
      :nxt_hint:`steampunk.unit.listener <This task configures a listener in Unit>`:
        pattern: ":nxt_hint:`*:3000 <The listener's name in the configuration>`"
        pass: :nxt_hint:`applications/sample <Goes straight to 'pass' in the listener's configuration>`
```

The final preparation step is the [host inventory](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)
that lists your managed hosts’ addresses:

```yaml
all:
  children:
    unit_hosts:
      hosts:
        :nxt_hint:`203.0.113.1 <Arbitrary host address>`:
```

With everything in place, start the playbook:

```bash
$ ansible-playbook -i :nxt_hint:`inventory.yaml <Inventory filename>` :nxt_hint:`playbook.yaml <Playbook filename>`

      PLAY [Install and run NGINX Unit] ***

      ...

      TASK [Expose application via port 3000] ***
      ok: [203.0.113.1]

      PLAY RECAP ********************************
      203.0.113.1                  : ok=15   changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

If it’s OK, try the app at the host address from the inventory and the port
number set in the playbook:

```bash
$ curl 203.0.113.1:3000

      Hello, Python on Unit!
```
