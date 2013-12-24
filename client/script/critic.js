/* global document: false, window: true, $: true, io: false, navigator: false, mocha: false, Q: false */

window.criticJs = function(serverUrl, browserId) {
    this.initialize = function(serverUrl, browserId) {
        this.iframe = $("#testHarness")[0];
        var socket = io.connect(serverUrl);
        this.browserId = browserId;
        var files = [];
        socket.emit('browser-info', { browser: navigator.userAgent, id: this.browserId });
        socket.on('testFiles', function(serverFiles) {
            files = JSON.parse(serverFiles);
            var runner = wireMocha(socket);
            var allFiles = [];
            for (var file in files) {
                allFiles.push($.loadScript(files[file]));
            }
            Q.allSettled(allFiles).then(function() {
                runner.run();
            });
        });

        $(window).on('beforeunload', function(){
            socket.emit('disconnect', {id: this.browserId});
        });
    };

    var wireMocha = function(socket) {
        var me = this;
        mocha.setup('bdd');
        mocha.checkLeaks();
        mocha.globals(['jQuery']);
        var runner = mocha.run();
        runner.on('start', function() {
            //runner.total doesn't return number of test for some reason.
            //I think that's because tests are not loaded when runner is created
            //Might need to count them by hand through Suites/Tests properties of runner
            socket.emit('start', {total: runner.total, id: me.browserId });
        });
        runner.on('test', function(test) {
            test.errors = [];
        });
        runner.on('fail', function(test, error) {
            if (test.type === 'hook' || error.uncaught) {
                test.errors = [formatError(error)];
                runner.emit('test end', test);
            } else {
                test.errors.push(formatError(error));
            }
        });
        runner.on('end', function() {
            socket.emit('end', { failed: runner.failures, id: me.browserId });
        });
        runner.on('test end', function(test) {
            var skipped = test.pending === true;

            var result = {
                id: '',
                description: test.title,
                suite: [],
                success: test.state === 'passed',
                skipped: skipped,
                time: skipped ? 0 : test.duration,
                log: test.errors || []
            };

            var pointer = test.parent;
            while (!pointer.root) {
                result.suite.unshift(pointer.title);
                pointer = pointer.parent;
            }
            socket.emit('test end', { results: result, id: me.browserId });
        });

        var formatError = function(error) {
          var stack = error.stack;
          var message = error.message;

          if (stack) {
            var firstLine = stack.substring(0, stack.indexOf('\n'));
            if (message && firstLine.indexOf(message) === -1) {
              stack = message + '\n' + stack;
            }

            // remove mocha stack entries
            return stack.replace(/\n.+\/adapter(\/lib)?\/mocha.js\?\d*\:.+(?=(\n|$))/g, '');
          }

          return message;
        };

        return runner;
    };

    this.loadPage = function(url) {
        var deferred = Q.defer();
        var iframe = this.iframe,
            loaded = false;
        iframe.onload = iframe.onreadystatechange = function() {
            if ((iframe.readyState  && iframe.readyState !== "complete" && iframe.readyState !== "loaded" ) || loaded) {
                return false;
            }
            iframe.onload = iframe.onreadystatechange = null;
            loaded = true;
            deferred.resolve(iframe.contentWindow.location.href);
        };
        iframe.src = url;
        return deferred.promise;
    };

    var me = this;

    $(document).ready(function() {
        me.initialize(serverUrl, browserId);
    });
    return this;
};
