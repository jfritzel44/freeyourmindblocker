// Function to update the blocklist dynamically
function updateBlockedSites(sites) {
  // Generate rules dynamically
  const rules = sites.flatMap((site) => {
    return [
      {
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: `*://${site}/*`,
          resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest"],
        },
      },
      {
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: `*://www.${site}/*`,
          resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest"],
        },
      },
    ];
  });

  // Get existing rules and remove them before adding new ones
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const existingRuleIds = existingRules.map((rule) => rule.id);

    // Safeguard: If there are no existing rules, log and proceed
    if (!existingRuleIds.length) {
      console.log(
        "No existing rules to remove. Proceeding to add new rules..."
      );
    }

    // Start assigning IDs after the max existing rule ID
    const uniqueStartId = existingRuleIds.length
      ? Math.max(...existingRuleIds) + 1
      : 1;

    // Assign unique IDs to the new rules
    const updatedRules = rules.map((rule, index) => ({
      ...rule,
      id: uniqueStartId + index, // Assign unique IDs to new rules
    }));

    // Check if the rules for `news.google.com` are present in the final list
    const newsGoogleRuleIds = updatedRules.filter((rule) =>
      rule.condition.urlFilter.includes("news.google.com")
    );
    console.log(
      "Final rules to be applied for news.google.com:",
      newsGoogleRuleIds
    );

    // Remove all existing rules and add the updated rules
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: existingRuleIds, // Clear old rules
        addRules: updatedRules, // Add new rules
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error updating rules:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("Rules successfully updated.");
        }
      }
    );
  });
}

// Load blocked sites from storage and apply them as rules
chrome.storage.sync.get(["blockedSites"], (result) => {
  const sites = result.blockedSites || [];

  // Explicitly check if `news.google.com` is in the list of blocked sites
  if (sites.includes("news.google.com")) {
    console.log("news.google.com is in the blocklist.");
  } else {
    console.warn("news.google.com is NOT in the blocklist.");
  }

  updateBlockedSites(sites);
});

// Listen for changes in blocked sites and update rules accordingly
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    const updatedSites = changes.blockedSites.newValue || [];

    // Explicitly check if `news.google.com` is in the updated list
    if (updatedSites.includes("news.google.com")) {
      console.log("news.google.com is now in the updated blocklist.");
    } else {
      console.warn("news.google.com is NOT in the updated blocklist.");
    }

    updateBlockedSites(updatedSites);
  }
});
