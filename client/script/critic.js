/* global document: false, socket: true, window: true, $: true */

window.critic = (function() {
    this.initialize = function() {
        this.iframe = $("#testHarness")[0];
    };

    this.scriptLoader = function(path, callback) {
        var el = document.createElement("script"),
            loaded = false;
        el.onload = el.onreadystatechange = function () {
          if ((el.readyState && el.readyState !== "complete" && el.readyState !== "loaded") || loaded) {
              return false;
          }
          el.onload = el.onreadystatechange = null;
          loaded = true;
          if (callback) {
              callback.call(this);
          }
        };
        el.async = true;
        el.src = path;
        document.getElementsByTagName('head')[0].appendChild(el);
    };

    this.loadPage = function(url, callback) {
        var iframe = this.iframe,
            loaded = false;
        iframe.onload = iframe.onreadystatechange = function() {
            if ((iframe.readyState  && iframe.readyState !== "complete" && iframe.readyState !== "loaded" ) || loaded) {
                return false;
            }
            iframe.onload = iframe.onreadystatechange = null;
            loaded = true;
            if (callback) {
                callback.call(this, url);
            }
        };
        iframe.src = url;
    };

    var me = this;

    $(document).ready(function() {
        me.initialize();
    });
    return this;
})();

window.assert = (function() {
    this.equals = function(var1, var2) {
        if (var1 === var2) {
            socket.emit('assertSuccess', { variables: arguments });
        } else {
            socket.emit('assertFail', { variables: arguments });
            throw new Error("Assertion failed");
        }
    };
    return this;
})();
