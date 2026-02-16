(function () {
  // このページのマークアップが存在する前提で動かす。
  function addClass(el, className) {
    el.classList.add(className);
  }

  // IE11の classList API を前提にクラスを除去する。
  function removeClass(el, className) {
    el.classList.remove(className);
  }

  // IE11で使えない toggle(force) の代替として add/remove を統一利用する。
  function setClass(el, className, enabled) {
    if (enabled) {
      addClass(el, className);
    } else {
      removeClass(el, className);
    }
  }

  // IE11の classList API を前提にクラス有無を判定する。
  function hasClass(el, className) {
    return el.classList.contains(className);
  }

  // IE11前提で position: sticky の代替を常に有効化する。
  // スクロール量を監視して fixed クラスを切り替え、
  // 固定時に本文幅が広がらないようにオフセットを維持する。
  function initStickyFallback() {
    var nav = document.querySelector(".js-sticky-nav");
    var content = document.querySelector(".content");
    var navTop = nav.offsetTop;
    var navLeft = nav.getBoundingClientRect().left +
      (window.pageXOffset || document.documentElement.scrollLeft || 0);

    function updateSticky() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      var shouldFix = viewportWidth > 900 && scrollY > navTop;
      var offset = nav.offsetWidth + 16;
      setClass(nav, "is-fixed", shouldFix);
      nav.style.left = shouldFix ? navLeft + "px" : "";
      content.style.marginLeft = shouldFix ? offset + "px" : "";
      content.style.width = shouldFix ? "calc(100% - " + offset + "px)" : "";
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

  // IE11前提で object-fit の代替を常に有効化する。
  // img を残しつつ、親要素の background-image で cover 表示を再現する。
  function initObjectFitFallback() {
    var images = document.querySelectorAll("[data-object-fit-fallback]");
    var i;
    for (i = 0; i < images.length; i += 1) {
      var image = images[i];
      var frame = image.parentNode;
      var src = image.getAttribute("src");
      frame.style.backgroundImage = "url(\"" + src + "\")";
      addClass(frame, "fit__frame--fallback");
    }
  }

  // data-src の実画像を src に差し替えて読み込みを開始する。
  function loadImage(image) {
    var source = image.getAttribute("data-src");
    image.setAttribute("src", source);
    image.removeAttribute("data-src");
    addClass(image, "is-loaded");
  }

  // IE11前提の遅延読み込み実装。
  // scroll/resize 監視で表示領域付近に来た画像だけ読み込む。
  function initLazyLoader() {
    var images = document.querySelectorAll(".js-lazy");

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

  // classList.toggle(name, force) の代わりに状態変数で開閉を管理する。
  function initTogglePanel() {
    var button = document.querySelector(".js-toggle-button");
    var panel = document.querySelector(".js-toggle-panel");
    var open = false;

    function render() {
      setClass(panel, "is-open", open);
      button.innerHTML = open ? "パネルを閉じる" : "パネルを開く";
    }

    button.addEventListener("click", function () {
      open = !open;
      render();
    });

    render();
  }

  // IE11前提で XMLHttpRequest を使用する。
  function requestJSON(url, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onSuccess(JSON.parse(xhr.responseText));
      } else {
        onError(new Error("HTTP " + xhr.status));
      }
    };
    xhr.send();
  }

  // 通信デモの UI 初期化。
  function initApiSample() {
    var button = document.querySelector(".js-load-data");
    var output = document.querySelector(".js-api-output");

    button.addEventListener("click", function () {
      output.textContent = "/data.json を読み込み中 ...";
      requestJSON("./data.json", function (data) {
        output.textContent = JSON.stringify(data, null, 2);
      }, function (error) {
        output.textContent = "読み込みに失敗しました: " + error.message;
      });
    });
  }

  // details/summary の代替として、クラス切り替えでアコーディオンを実装する。
  function initAccordion() {
    var triggers = document.querySelectorAll(".js-accordion-trigger");
    var i;

    function setState(trigger, panel, expanded) {
      setClass(trigger, "is-open", expanded);
      setClass(panel, "is-hidden", !expanded);
    }

    for (i = 0; i < triggers.length; i += 1) {
      (function (trigger) {
        var panelId = trigger.getAttribute("data-panel");
        var panel = document.getElementById(panelId);

        setState(trigger, panel, false);

        trigger.addEventListener("click", function () {
          var isOpen = hasClass(trigger, "is-open");
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
