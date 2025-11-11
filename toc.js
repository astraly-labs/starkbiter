// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="index.html">Introduction</a></li><li class="chapter-item expanded affix "><li class="part-title">Getting Started</li><li class="chapter-item expanded "><a href="getting_started/index.html"><strong aria-hidden="true">1.</strong> Overview</a></li><li class="chapter-item expanded "><a href="getting_started/installation.html"><strong aria-hidden="true">2.</strong> Installation</a></li><li class="chapter-item expanded "><a href="getting_started/quick_start.html"><strong aria-hidden="true">3.</strong> Quick Start</a></li><li class="chapter-item expanded "><a href="getting_started/examples.html"><strong aria-hidden="true">4.</strong> Examples</a></li><li class="chapter-item expanded affix "><li class="part-title">Core Concepts</li><li class="chapter-item expanded "><a href="core_concepts/architecture.html"><strong aria-hidden="true">5.</strong> Architecture</a></li><li class="chapter-item expanded "><a href="core_concepts/environment.html"><strong aria-hidden="true">6.</strong> Environment</a></li><li class="chapter-item expanded "><a href="core_concepts/middleware.html"><strong aria-hidden="true">7.</strong> Middleware</a></li><li class="chapter-item expanded "><a href="core_concepts/forking.html"><strong aria-hidden="true">8.</strong> Forking</a></li><li class="chapter-item expanded affix "><li class="part-title">Usage Guide</li><li class="chapter-item expanded "><a href="usage/index.html"><strong aria-hidden="true">9.</strong> Overview</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="usage/starkbiter_core/index.html"><strong aria-hidden="true">9.1.</strong> Starkbiter Core</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="usage/starkbiter_core/environment.html"><strong aria-hidden="true">9.1.1.</strong> Environment API</a></li><li class="chapter-item expanded "><a href="usage/starkbiter_core/middleware.html"><strong aria-hidden="true">9.1.2.</strong> Middleware API</a></li></ol></li><li class="chapter-item expanded "><a href="usage/starkbiter_engine/index.html"><strong aria-hidden="true">9.2.</strong> Starkbiter Engine</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="usage/starkbiter_engine/agents.html"><strong aria-hidden="true">9.2.1.</strong> Agents</a></li><li class="chapter-item expanded "><a href="usage/starkbiter_engine/behaviors.html"><strong aria-hidden="true">9.2.2.</strong> Behaviors</a></li><li class="chapter-item expanded "><a href="usage/starkbiter_engine/worlds_and_universes.html"><strong aria-hidden="true">9.2.3.</strong> Worlds and Universes</a></li><li class="chapter-item expanded "><a href="usage/starkbiter_engine/configuration.html"><strong aria-hidden="true">9.2.4.</strong> Configuration</a></li></ol></li><li class="chapter-item expanded "><a href="usage/starkbiter_cli.html"><strong aria-hidden="true">9.3.</strong> Starkbiter CLI</a></li><li class="chapter-item expanded "><a href="usage/starkbiter_macros.html"><strong aria-hidden="true">9.4.</strong> Starkbiter Macros</a></li><li class="chapter-item expanded "><a href="usage/starkbiter_bindings.html"><strong aria-hidden="true">9.5.</strong> Starkbiter Bindings</a></li></ol></li><li class="chapter-item expanded "><li class="part-title">Advanced Topics</li><li class="chapter-item expanded "><a href="advanced/testing_strategies.html"><strong aria-hidden="true">10.</strong> Testing Strategies</a></li><li class="chapter-item expanded "><a href="advanced/simulation_techniques.html"><strong aria-hidden="true">11.</strong> Simulation Techniques</a></li><li class="chapter-item expanded "><a href="advanced/anomaly_detection.html"><strong aria-hidden="true">12.</strong> Anomaly Detection</a></li><li class="chapter-item expanded "><a href="advanced/performance.html"><strong aria-hidden="true">13.</strong> Performance Optimization</a></li><li class="chapter-item expanded affix "><li class="part-title">Contributing</li><li class="chapter-item expanded "><a href="contributing/index.html"><strong aria-hidden="true">14.</strong> Contributing Guide</a></li><li class="chapter-item expanded "><a href="contributing/development.html"><strong aria-hidden="true">15.</strong> Development Setup</a></li><li class="chapter-item expanded "><a href="contributing/vulnerability_corpus.html"><strong aria-hidden="true">16.</strong> Vulnerability Corpus</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
