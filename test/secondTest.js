/* global describe: false, it: false, critic: false, assert: false, $: true */

describe("Second test file", function() {
    describe('Loading npmjs.org page', function() {
        it('Should load npmjs.org page', function(done) {
            critic.loadPage("http://npmjs.org/").then(function(url) {
                assert.equal(url, "http://npmjs.org/");
                done();
            });
        });
        it('Should have search box', function() {
            assert.isTrue($("input[name='q']", $("#testHarness").contents()).is(":visible"));
        });
        it('Should fail', function() {
            assert.isTrue($("#asdfasfdasdf", $("#testHarness").contents()).length > 0);
        });
    });
});
