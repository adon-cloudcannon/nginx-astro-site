// Copyright (C) 2020-2023, NGINX, Inc.

// JS implementation of Sphinx extension to add ReadTheDocs-style "Edit on GitHub" links to the
// sidebar.  Loosely based on https://github.com/astropy/astropy/pull/347

// Usage:

// BaseLayout.astro:
//   { edit_on_github_url && <div class="nxt_github_link"><a href={ edit_on_github_url }><div></div>Edit this page</a></div>}


import meta from '../data/meta.json'

function getGithubUrl(app) {

    let file = app.props.frontmatter.file
    let matches = file.match(/(?<=pages\/).*$/g)
    let filename = matches[0]
    // Forms a URL of the corresponding GitHub page.
    const project = meta.edit_on_github_project;
    const branch = meta.edit_on_github_branch;
    return `https://github.com/${project}/edit/${branch}/source/${filename}`;
}

export { getGithubUrl }
