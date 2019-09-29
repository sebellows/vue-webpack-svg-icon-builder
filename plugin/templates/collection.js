const renderIconBox = (name) => {
    return `
<figure class="icon-box">
    <div id="icon-box-${name}" class="icon-wrapper">
        <svg class="icon">
          <use xlink:href="#${name}"></use>
        </svg>
    </div>
    <figcaption>${name}</figcaption>
</figure>`;
};

module.exports = function(svgSprite, ids) {
    const tmplStr = ids.map((id) => renderIconBox(id)).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <title>SVG Icon Collection</title>
    <style>
    html {
        font-family: sans-serif;
        line-height: 1.15;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
    }
    body { margin: 0; }
    article, aside, details, figcaption, figure, footer, header, main, menu, nav, section, summary { display: block; }
    audio, canvas, progress, video { display: inline-block; }
    .icon-box {
        padding: 5px 0;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        background-color: #eee;
        outline: 1px solid #fff;
        height: 100px;
        color: #333;
        vertical-align: top;
        text-align: center;
        font-size: 1rem;
        cursor: pointer;
    }
    .icon-box svg {
        width: 50px;
        height: 50px;
        fill: gray;
    }
    .icon-box:hover {
        background-color: #ddd;
        color: #337ab7;
    }
    .icon-box:hover svg { fill: #337ab7 }
    .icon-box.selected {
        background-color: #337ab7;
        color: #fff;
        opacity: .9;
    }
    .icon-box.selected svg { fill: #fff; }

    @media only screen and (min-width: 768px) {
        .icon-box{ width: 12%; }
    }
    @media only screen and (max-width: 768px) {
        .icon-box { width: 24%; }
    }
    @media only screen and (max-width: 480px) {
        .si-figure { width: 48%; }
    }
    .icon-box.inline {
        height: 1.2em;
        width: 1.2em;
        vertical-align: sub;
    }
    .icon-box.white { fill: #fff; }
    </style>
</head>
<body>
    ${svgSprite}
    <article>
        ${tmplStr}
    </article>
</body>
</html>
`;
};
