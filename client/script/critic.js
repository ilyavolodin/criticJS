/* global document: false, window: true, $: true, io: false, navigator: false, mocha: false */

window.criticJs = function() {
    this.initialize = function(serverUrl) {
        this.iframe = $("#testHarness")[0];
        var socket = io.connect(serverUrl);
        var files = [];
        socket.emit('browser-info', { browser: navigator.userAgent });
        socket.on('testFiles', function(serverFiles) {
            files = JSON.parse(serverFiles);
            var runner = wireMocha(socket);
            allTestRunner(files, runner);
        });

        var allTestRunner = function(files, runner) {
            if (files.length === 0) {
                return;
            }
            //this is not going to work, since second time this is going to run,
            //it will run all tests from both first and second file.
            //Need to either figure out how to remove old tests, or load all files first.
            loadAndRunTests(files.pop(), runner).then(allTestRunner(files, runner));
        };

        var loadAndRunTests = function(filePath, runner) {
            return $.Deferred(function(deferred) {
                //I think this is the wrong event to listen to
                //I think this fires after each test completion.
                //end seems like the correct even. Mocha lacks
                //documentation on the subject.
                runner.removeListener('test end', deferred.resolve);
                runner.on('test end', deferred.resolve);
                $.loadScript(filePath).then(function() { runner.run();});
                return deferred.promise();
            });
        };
    };

    var wireMocha = function(socket) {
        mocha.setup('bdd');
        mocha.checkLeaks();
        mocha.globals(['jQuery']);
        var runner = mocha.run();
        runner.on('start', function() {
            socket.emit('start', runner.total);
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
            socket.emit('test end', result);
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
