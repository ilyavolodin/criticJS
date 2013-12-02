/* global describe: false, it: false, critic: false, assert: false, $: true */

describe('Testing nodejs.org', function() {
    describe('Loading page', function() {
        it('Should load nodejs.org page', function(done) {
            critic.loadPage("http://www.nodejs.org", function(url) {
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
