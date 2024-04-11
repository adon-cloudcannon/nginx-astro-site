const snip = (name) =>
  path.join(__dirname, `.cloudcannon/snippets/${name}.json`);

module.exports = {
  source: "src",
  paths: {
    uploads: "uploads",
    static: "public",
    collections: "",
    data: "",
    layouts: ""
  },
  collections_config: {
    pages: {
      path: "pages",
      output: false,
      icon: "notes",
      disable_add: false,
      disable_add_folder: false,
      disable_file_actions: false,
      schemas: {
        default: {
          name: "New Page",
          path: "schemas/page.mdx"
        }
      }
    }
  },
  timezone: "Etc/UTC",
  _editables: {
    content: {
      blockquote: true,
      bold: true,
      format: "p h1 h2 h3 h4 h5 h6",
      italic: true,
      strike: true,
      subscript: true,
      superscript: true,
      underline: true,
      link: true,
      bulletedlist: true,
      indent: true,
      numberedlist: true,
      outdent: true,
      code: true,
      snippet: true
    }
  },
  _snippets_imports: {
    mdx : true
  },
  _snippets: {
    test_component: require(snip("test_component"))
  }
}

