// omnibox `rg` tools
chrome.omnibox.onInputEntered.addListener(function(text) {
  var newURL = `https://rawg.io/search?query=${encodeURIComponent(text)}`;
  chrome.tabs.create({ url: newURL });
});

chrome.omnibox.onInputChanged.addListener(function(text) {
  chrome.omnibox.setDefaultSuggestion({
    description: `Search for <match>${text}</match> on RAWG`
  });
});
