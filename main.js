const { JSDOM } = require("jsdom");

const express = require("express");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "docs" + (req.url == "/" ? "/index.html" : req.url)));
});

app.post("/{*any}", async (req, res) => {
    const page = await fetch(req.body.search);

    var dom = new JSDOM(await page.text());

    var children = Array.from(dom.window.document.children);
    for (var i = 0; i < children.length; i++) {
        children[i] = await parseChild(children[i], req.body.search);
    }

    res.type(".html");

    res.send(dom.serialize());
});

async function parseChild(child, baseUrl) {
    if (child.hasAttribute("src")) {
        var url = child.getAttribute("src");
        if (url[0] == "." || url[0] == "/") {
            url = baseUrl + "/" + url.substring(url.indexOf("/")+1, url.length);
        }

        const src = await fetch(url);
        const blob = await src.blob();
        
        const dataurl = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`;
        
        child.setAttribute("src", dataurl);
    }

    if (child.hasAttribute("href")) {
        var url = child.getAttribute("href");
        if (url[0] == "." || url[0] == "/") {
            url = baseUrl + "/" + url.substring(url.indexOf("/")+1, url.length);
        }

        if (child.tagName == "A") {
            child.setAttribute(
                "onclick",
                `const form = document.createElement("form");
                form.method = "post";
                form.action = "https://pipe-6080.use2.devtunnels.ms/browser.html";
                const input = document.createElement("input");
                input.name = "search";
                input.value = "${url}";
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);`
            );
            child.setAttribute("href", "");
        } else if (child.tagName == "LINK") {
            const src = await fetch(url);
            const blob = await src.blob();
            
            const dataurl = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`;
            child.setAttribute("href", dataurl);
        }
    }

    var nested = Array.from(child.children);
    for (var i = 0; i < nested.length; i++) {
        nested[i] = await parseChild(nested[i], baseUrl);
    }

    return child;
}

app.listen(6080, () => {
    console.log(`Proxy started on port ${6080}`);
});
