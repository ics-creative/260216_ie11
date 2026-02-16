(function () {
  var root = document.documentElement;

  function addClass(el, className) {
    if (!el) {
      return;
    }
    if (el.classList) {
      el.classList.add(className);
      return;
    }
    if ((" " + el.className + " ").indexOf(" " + className + " ") === -1) {
      el.className += " " + className;
    }
  }

  function removeClass(el, className) {
    if (!el) {
      return;
    }
    if (el.classList) {
      el.classList.remove(className);
      return;
    }
    el.className = el.className.replace(new RegExp("(^|\\s)" + className + "(\\s|$)", "g"), " ");
  }

  function setClass(el, className, enabled) {
    if (enabled) {
      addClass(el, className);
    } else {
      removeClass(el, className);
    }
  }

  function supportsSticky() {
    var probe = document.createElement("div");
    probe.style.cssText = "position:sticky;position:-webkit-sticky;";
    return probe.style.position.indexOf("sticky") !== -1;
  }

  function supportsObjectFit() {
    return "objectFit" in root.style;
  }

  function initStickyFallback() {
    var nav = document.querySelector(".js-sticky-nav");
    if (!nav || supportsSticky()) {
      return;
    }

    addClass(root, "no-sticky");

    var navTop = nav.offsetTop;
    var navLeft = nav.getBoundingClientRect().left +
      (window.pageXOffset || document.documentElement.scrollLeft || 0);

    function updateSticky() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var shouldFix = scrollY > navTop;
      setClass(nav, "is-fixed", shouldFix);
      nav.style.left = shouldFix ? navLeft + "px" : "";
    }

    window.addEventListener("scroll", updateSticky);
    window.addEventListener("resize", function () {
      navTop = nav.offsetTop;
      navLeft = nav.getBoundingClientRect().left +
        (window.pageXOffset || document.documentElement.scrollLeft || 0);
      updateSticky();
    });

    updateSticky();
  }

  function initObjectFitFallback() {
    if (supportsObjectFit()) {
      return;
    }

    addClass(root, "object-fit-fallback");

    var images = document.querySelectorAll("[data-object-fit-fallback]");
    var i;
    for (i = 0; i < images.length; i += 1) {
      var image = images[i];
      var frame = image.parentNode;
      var src = image.getAttribute("src");
      if (!frame || !src) {
        continue;
      }
      frame.style.backgroundImage = "url(\"" + src + "\")";
      addClass(frame, "fit__frame--fallback");
    }
  }

  function loadImage(image) {
    var source = image.getAttribute("data-src");
    if (!source) {
      return;
    }
    image.setAttribute("src", source);
    image.removeAttribute("data-src");
    addClass(image, "is-loaded");
  }

  function initLazyLoader() {
    var images = document.querySelectorAll(".js-lazy");
    if (!images.length) {
      return;
    }

    var i;

    if ("loading" in HTMLImageElement.prototype) {
      for (i = 0; i < images.length; i += 1) {
        images[i].setAttribute("loading", "lazy");
        loadImage(images[i]);
      }
      return;
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        var j;
        for (j = 0; j < entries.length; j += 1) {
          if (entries[j].isIntersecting) {
            loadImage(entries[j].target);
            observer.unobserve(entries[j].target);
          }
        }
      }, { rootMargin: "120px 0px" });

      for (i = 0; i < images.length; i += 1) {
        observer.observe(images[i]);
      }
      return;
    }

    function onScroll() {
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      var pending = 0;
      var k;

      for (k = 0; k < images.length; k += 1) {
        var image = images[k];
        if (!image.getAttribute("data-src")) {
          continue;
        }
        var rect = image.getBoundingClientRect();
        if (rect.top < viewport + 120) {
          loadImage(image);
        } else {
          pending += 1;
        }
      }

      if (pending === 0) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  function initTogglePanel() {
    var button = document.querySelector(".js-toggle-button");
    var panel = document.querySelector(".js-toggle-panel");
    if (!button || !panel) {
      return;
    }

    var open = false;

    function render() {
      setClass(panel, "is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      button.innerHTML = open ? "Close panel" : "Open panel";
    }

    button.addEventListener("click", function () {
      open = !open;
      render();
    });

    render();
  }

  function requestJSON(url, onSuccess, onError) {
    if (window.fetch) {
      window.fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          return response.json();
        })
        .then(onSuccess)["catch"](onError);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        var payload;
        try {
          payload = JSON.parse(xhr.responseText);
        } catch (error) {
          onError(error);
          return;
        }
        onSuccess(payload);
      } else {
        onError(new Error("HTTP " + xhr.status));
      }
    };
    xhr.send();
  }

  function initApiSample() {
    var button = document.querySelector(".js-load-data");
    var output = document.querySelector(".js-api-output");

    if (!button || !output) {
      return;
    }

    button.addEventListener("click", function () {
      output.textContent = "Loading /data.json ...";
      requestJSON("./data.json", function (data) {
        output.textContent = JSON.stringify(data, null, 2);
      }, function (error) {
        output.textContent = "Request failed: " + error.message;
      });
    });
  }

  function initAccordion() {
    var triggers = document.querySelectorAll(".js-accordion-trigger");
    var i;

    function setState(trigger, panel, expanded) {
      trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
      setClass(panel, "is-hidden", !expanded);
    }

    for (i = 0; i < triggers.length; i += 1) {
      (function (trigger) {
        var panelId = trigger.getAttribute("data-panel");
        var panel = document.getElementById(panelId);

        if (!panel) {
          return;
        }

        setState(trigger, panel, false);

        trigger.addEventListener("click", function () {
          var isOpen = trigger.getAttribute("aria-expanded") === "true";
          setState(trigger, panel, !isOpen);
        });
      })(triggers[i]);
    }
  }

  initStickyFallback();
  initObjectFitFallback();
  initLazyLoader();
  initTogglePanel();
  initApiSample();
  initAccordion();
})();
