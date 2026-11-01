/**
 * Inline script for <head>. It marks the page before first paint so [data-reveal]
 * elements start hidden, then reveals them as they scroll into view. It runs
 * before hydration, and watches for elements added by client-side navigation.
 * Elements with data-reveal-by are revealed by something else (EnergyFlow).
 */
export const REVEAL_RUNTIME = `(function(){
if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var d=document.documentElement;d.classList.add("js-reveal");
function init(){
var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.setAttribute("data-revealed","");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:0.08});
function scan(root){root.querySelectorAll("[data-reveal]:not([data-revealed]):not([data-reveal-by])").forEach(function(el){io.observe(el);});}
scan(document);
new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.matches("[data-reveal]:not([data-revealed]):not([data-reveal-by])"))io.observe(n);scan(n);});});}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();`;
