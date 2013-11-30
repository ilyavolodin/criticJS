/* global document: false, socket: true, window: true, $: true */

window.critic = function() {
    this.initialize = function(serverUrl) {
        this.iframe = $("#testHarness")[0];
        var socket = io.connect(serverUrl);
        var files = [];
        socket.emit('browser-info', { browser: navigator.userAgent });
        socket.on('testFiles', function(serverFiles) {
            files = JSON.parse(serverFiles);
            for (var i=0, l=files.length; i<l; i++) {
                $.getScript(files[i]);
            }
        });
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
};

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
