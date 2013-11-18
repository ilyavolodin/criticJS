critic.loadPage("http://www.nodejs.org", function(url) {
    assert.equals(url, "http://www.nodejs.org");
});
