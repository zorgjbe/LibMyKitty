// ==UserScript==
// @name TestMyKitty
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Library of utility
// @author Zoe
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @grant none
// @run-at document-end
// ==/UserScript==

const scriptSrc = "http://localhost:5500/test/dist/testMyKitty.js?_=" + Date.now();

let script = document.createElement("script");
script.setAttribute("language", "JavaScript");
script.setAttribute("crossorigin", "anonymous");
script.setAttribute("src", scriptSrc);
document.head.appendChild(script);
