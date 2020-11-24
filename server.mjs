import Koa from 'koa'

import sites from './config/sites.mjs'

const imagesLength = 50;
const scriptsSrc = [
  'https://unpkg.com/react@17/umd/react.production.min.js"',
  'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
  'https://code.jquery.com/jquery-3.5.1.min.js'
]

const stylesSrc = [
  'https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
  'https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
]

function transformSite(site){

  const splitted = site.split('--');
  const res = splitted.map(part => {
    return part.split('-');
  })
  
  const obj = {
    images: res[0][0],
    scripts: res[1][0],
    styles: res[2][0],
  }
  return obj;
}


const template = (path, {images, scripts, styles}) => {

  const scriptsMarkup = scriptsSrc
  .map((name) => {
    const attrs = scripts == 'a' ? 'async' : '';
    return `<script src="${name}" ${attrs}></script>`;
  })
  .join('\n');

  const stylesMarkup = stylesSrc
  .map((name) => {
    if(styles == 'a') {
      return `
        <link rel="preload" href="${name}" as="style" onload="this.onload=null;this.rel='stylesheet'">
        <noscript><link rel="stylesheet" href="${name}"></noscript>
      `
    }
    else return `<link href="${name}" rel="stylesheet">`;
  })
  .join('\n');
 
  const imageAttrs = images == 'a' ? 'loading="lazy"' : '';

  const imagesMarkup = new Array(imagesLength).fill(1).map((_, index) => {
    return `<img src="https://picsum.photos/200/300?random=${index+1}" ${imageAttrs} />`;
  }).join('\n')

return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${path}</title>
  ${stylesMarkup}
  ${scriptsMarkup}
</head>
<body>
<div id="root">
  <h1>Welcome on our site</h1>
  <p>Path: ${path}</p>
  ${imagesMarkup}
</div>
</body>
</html>`;
}
const app = new Koa();

app.use(async ctx => {
  const path = ctx.path.slice(1);
  console.log('req: ' + path);

  if(sites.includes(path)) ctx.body = template(path, transformSite(path));
  else ctx.body = 'ok'
});

app.listen(3000);