addScript("preview/script/lib/systeminfo.js");
addScript("preview/script/lib/menu.js");
addScript("preview/script/lib/menuItem.js");
addScript("preview/script/lib/widget.js");

// Includes a script file by writing a script tag.
function addScript(src) {
    document.write("<script type=\"text/javascript\" src=\"" + src + "\"></script>");
}