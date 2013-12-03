/* global describe: false, it: false, critic: false, assert: false, $: true */

describe('Testing nodejs.org', function() {
    describe('Dummy', function() {
        it('True should be true', function() {
            assert.equal(true, true);
        });
    });
    describe('Loading page', function() {
        it('Should load nodejs.org page', function(done) {
            critic.loadPage("http://www.nodejs.org").then(function(url) {
                assert.equal(url, "http://www.nodejs.org");
                done();
            });
        });
        it('Should have download button', function() {
            assert.isTrue($("#downloadbutton", $("#testHarness").contents()).is(":visible"));
        });
        it('Should fail', function() {
            assert.isTrue($("#asdfasfdasdf", $("#testHarness").contents()).length > 0);
        });
    });
});
