import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import prism from 'prismjs';
import loadLanguages from 'prismjs/components/';

loadLanguages(['javascript', 'jsx', 'css', 'markup', 'bash', 'json', 'tree']);

let replaceIndex = 0;
let replaceArr = []

prism.languages['none'] = { };

function nxt_hint(content){
    let result = content.replace(/(?<hint_marker>:nxt_hint:|:nxt_ph:)\s*\`((?<hint_display>[^`]*) (\<(?<hint_text>.*?)\>))\`/g,function(match,...args) {
        const groups = args.at(-1)
        let hint_marker = ""
        if(groups.hint_marker == ":nxt_hint:")
            hint_marker = "NXTHINT"
        else if(groups.hint_marker == ":nxt_ph:")
            hint_marker = "NXTPH"

        let obj = {
            "index":replaceIndex,
            "type":hint_marker,
            "hint_display":groups.hint_display,
            "hint_text":groups.hint_text
        }
        replaceArr.push(obj)
        let replaceMarker = `NXTREPLACE${replaceIndex}`
        replaceIndex++;
        return replaceMarker
    });

    const marked = new Marked(
        markedHighlight({
          highlight: function(code, lang) {
            if (prism.languages[lang]) {
              let highlighted = prism.highlight(code, prism.languages[lang], lang);
              let replaced = highlighted.replace(/(?<nxt_tag>NXTREPLACE\d+)/g, function(match,...args) {
                const groups = args.at(-1)
                let index = groups.nxt_tag.replace("NXTREPLACE","")
                let filtered = replaceArr.filter(x => x.index === parseInt(index))[0]
                let clazz = ""
                if(filtered.type == "NXTHINT")
                    clazz = "nxt_hint"
                else if(filtered.type == "NXTPH")
                    clazz = "nxt_ph"

                return `<span title="${filtered.hint_text}" class="${clazz}">${filtered.hint_display}</span>`
              })
              return replaced;
            } else {
              return code;
            }
          }
        })
    );

    const compiledContent = marked.parse(result);

    return compiledContent;
}

function parse_marked(content){
    const marked = new Marked();
    return marked.parse(content)
}

export { 
    nxt_hint,
    parse_marked
}