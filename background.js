// Function to update the blocklist dynamically
function updateBlockedSites(sites) {
  const rules = sites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: { urlFilter: site, resourceTypes: ["main_frame"] },
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map((rule) => rule.id),
    addRules: rules,
  });
}

// Load blocked sites from storage and apply them as rules
chrome.storage.sync.get(["blockedSites"], (result) => {
  const sites = result.blockedSites || [];
  updateBlockedSites(sites);
});

// Listen for changes in blocked sites and update rules accordingly
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    updateBlockedSites(changes.blockedSites.newValue || []);
  }
});
