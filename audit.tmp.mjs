import { sanitizeHtmlBody } from "./src/api/v1/services/mailParserService.js";
const D = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const cases = {
  // ---- CSS forms ----
  "<style> in head":            '<html><head><style>.a{color:red}</style></head><body>x</body></html>',
  "<style> in body":            '<body><style>.b{color:blue}</style><p class="b">y</p></body>',
  "<link rel=stylesheet>":      '<head><link rel="stylesheet" href="https://cdn.co/e.css"></head>',
  "@import in style":           '<style>@import url("https://cdn.co/e.css");</style>',
  "@media query":               '<style>@media (max-width:600px){.a{display:block}}</style>',
  "@font-face":                 '<style>@font-face{font-family:X;src:url(https://c/f.woff2)}</style>',
  "CSS var()":                  '<style>:root{--c:#f00}.a{color:var(--c)}</style>',
  "inline style attr":          '<div style="color:red;font-size:12px">x</div>',
  "inline !important":          '<div style="color:red !important">x</div>',
  "inline flex/grid":           '<div style="display:flex;gap:8px;grid-template-columns:1fr">x</div>',
  "inline bg-image https":      '<div style="background-image:url(https://c/b.png)">x</div>',
  "inline bg-image cid":        '<div style="background-image:url(cid:bg@x)">x</div>',
  "inline transform/shadow":    '<div style="transform:scale(1);box-shadow:0 1px 2px #000">x</div>',
  "presentational attrs":       '<table bgcolor="#eee" width="600" align="center" cellpadding="4"><tr><td valign="top" nowrap>c</td></tr></table>',
  "<font> tag":                 '<font face="Arial" color="#333" size="2">t</font>',
  "<center>/<big>/<strike>":    '<center><big><strike>t</strike></big></center>',
  "class only (no style blk)":  '<div class="hero">x</div>',
  "style attr on td/table":     '<table style="border-collapse:collapse"><td style="padding:4px">c</td></table>',
  "meta viewport":              '<head><meta name="viewport" content="width=device-width"></head>',

  // ---- image forms ----
  "<img https>":                '<img src="https://c/a.png" alt="a">',
  "<img data:>":                `<img src="${D}">`,
  "<img cid:>":                 '<img src="cid:logo@x">',
  "<img srcset https>":         '<img srcset="https://c/a.png 1x, https://c/a2.png 2x" src="https://c/a.png">',
  "<img srcset data:>":         `<img srcset="${D} 1x" src="${D}">`,
  "<img protocol-relative>":    '<img src="//cdn.co/a.png">',
  "<img width/height/align>":   '<img src="https://c/a.png" width="600" height="200" align="center" border="0">',
  "<img loading/referrer>":     '<img src="https://c/a.png" loading="lazy" referrerpolicy="no-referrer">',
  "<picture><source>":          '<picture><source srcset="https://c/a.webp" type="image/webp"><img src="https://c/a.png"></picture>',
  "<video poster>":             '<video src="https://c/v.mp4" poster="https://c/p.jpg" controls></video>',
  "background attr on table":   '<table background="https://c/bg.png"><tr><td>x</td></tr></table>',
  "background attr on body":    '<body background="https://c/bg.png">x</body>',
  "inline SVG":                 '<svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="red"/></svg>',
  "Outlook VML bg":             '<v:rect style="width:600px" fillcolor="none"><v:fill src="https://c/bg.png" type="frame"/></v:rect>',
  "image map <map>/<area>":     '<img src="https://c/a.png" usemap="#m"><map name="m"><area shape="rect" coords="0,0,10,10" href="https://c"></map>',
  "svg as data uri":            '<img src="data:image/svg+xml;base64,PHN2Zy8+">',
  "<figure>/<figcaption>":      '<figure><img src="https://c/a.png"><figcaption>cap</figcaption></figure>',
};

let fails = [];
for (const [name, html] of Object.entries(cases)) {
  const out = sanitizeHtmlBody(html);
  const survived = out.trim().length > 0;
  const norm = (s) => s.replace(/\s+/g, "").replace(/>/g, ">");
  // did the meaningful payload survive?
  const lost = survived && !norm(out).includes(norm(html).slice(0, 40));
  if (!survived) { fails.push(name); console.log(`DROPPED  ${name}`); }
  else if (lost)  { fails.push(name); console.log(`MANGLED  ${name}\n         in : ${html}\n         out: ${out}`); }
  else console.log(`ok       ${name}`);
}
console.log(`\n${fails.length} problem(s)`);
