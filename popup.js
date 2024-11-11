// References to the DOM elements
const blockedSitesList = document.getElementById("blockedSitesList");
const siteInput = document.getElementById("siteInput");
const addSiteButton = document.getElementById("addSiteButton");
const errorMessage = document.getElementById("errorMessage");

// Trigger add on Enter key press
siteInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addSiteButton.click(); // Trigger the add button click event
  }
});

// Load blocked sites from storage and display them
function loadBlockedSites() {
  chrome.storage.sync.get(["blockedSites"], (result) => {
    const sites = result.blockedSites || [];
    blockedSitesList.innerHTML = ""; // Clear the list
    sites.forEach((site) => addSiteToList(site));
  });
}

// Add site to the blocklist in the UI and storage
function addSiteToList(site) {
  const listItem = document.createElement("li");
  listItem.textContent = site;

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.style.marginLeft = "10px";
  removeButton.style.cursor = "pointer";
  removeButton.addEventListener("click", () => removeSite(site));

  listItem.appendChild(removeButton);
  blockedSitesList.appendChild(listItem);
}

// Add a new site to the blocked sites list
addSiteButton.addEventListener("click", () => {
  const site = siteInput.value.trim();
  if (site) {
    chrome.storage.sync.get(["blockedSites"], (result) => {
      const sites = result.blockedSites || [];
      if (sites.includes(site)) {
        // Show error message if site is already in the list
        showError("This site is already in the blocked list.");
      } else {
        // Add site if not already in list
        sites.push(site);
        chrome.storage.sync.set({ blockedSites: sites }, () => {
          addSiteToList(site); // Update the UI
          siteInput.value = ""; // Clear input
          clearError(); // Clear any previous error message
        });
      }
    });
  }
});

// Remove a site from the blocked sites list
function removeSite(site) {
  chrome.storage.sync.get(["blockedSites"], (result) => {
    const sites = result.blockedSites || [];
    const updatedSites = sites.filter((s) => s !== site);
    chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
      loadBlockedSites(); // Refresh the UI
    });
  });
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

// Clear error message
function clearError() {
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

// Initialize the popup by loading the current blocked sites
loadBlockedSites();
