// Main function to detect and highlight blacklisted addresses
function highlightBlacklistedAddresses() {
  console.log("[MultiversX Blacklist] Starting address detection...");
  // Load blacklist from storage
  chrome.storage.sync.get('blacklist', function(data) {
    const blacklist = data.blacklist || [];
    
    console.log("[MultiversX Blacklist] Loaded blacklist:", blacklist);
    
    if (blacklist.length === 0) {
      console.log("[MultiversX Blacklist] No addresses to highlight");
      return; // No addresses to highlight
    }
    
    // Create a map for faster lookups
    const blacklistMap = {};
    blacklist.forEach(item => {
      blacklistMap[item.address.toLowerCase()] = item.label;
    });
    
    // Check for address in the header (account details page)
    checkAddressHeader(blacklistMap);
    
    // Check for addresses in transaction tables
    checkTransactionTables(blacklistMap);
  });
}

// Function to check and highlight the main address in the header
function checkAddressHeader(blacklistMap) {
  console.log("[MultiversX Blacklist] Checking address header...");
  // Target the address span in the header
  const addressElement = document.querySelector('span[data-testid="address"]');
  
  if (addressElement) {
    const address = addressElement.textContent.trim();
    console.log("[MultiversX Blacklist] Found address in header:", address);
    
    // Check if this address is in our blacklist
    if (blacklistMap[address.toLowerCase()]) {
      const label = blacklistMap[address.toLowerCase()];
      console.log("[MultiversX Blacklist] Address is blacklisted:", label);
      
      // Highlight the address
      highlightElement(addressElement, label, address);
    }
  }
}

// Function to check and highlight addresses in transaction tables
function checkTransactionTables(blacklistMap) {
  console.log("[MultiversX Blacklist] Checking transaction tables...");
  
  // Look for transaction tables - these typically contain addresses in various cells
  const transactionRows = document.querySelectorAll('table tbody tr');
  
  if (transactionRows.length > 0) {
    console.log("[MultiversX Blacklist] Found transaction table with", transactionRows.length, "rows");
    
    transactionRows.forEach(row => {
      // 1. Check addresses in links (most common case)
      const addressLinks = row.querySelectorAll('td a[href*="/accounts/"]');
      
      addressLinks.forEach(cell => {
        const href = cell.getAttribute('href') || '';
        const addressMatch = href.match(/\/accounts\/(erd1[a-z0-9]+)/i);
        
        if (addressMatch && addressMatch[1]) {
          const address = addressMatch[1];
          
          // Check if address is in blacklist
          if (blacklistMap[address.toLowerCase()]) {
            const label = blacklistMap[address.toLowerCase()];
            console.log("[MultiversX Blacklist] Found blacklisted address in link:", address, label);
            highlightElement(cell, label, address);
          }
        }
      });
      
      // 2. Check addresses in spans with data-testid (like in your example)
      const addressSpans = row.querySelectorAll('span.hidden-text-ref, span[data-testid]');
      
      addressSpans.forEach(span => {
        const text = span.textContent.trim();
        
        // Check if this text is an erd1 address
        if (text.match(/^erd1[a-z0-9]+$/i)) {
          const address = text;
          
          // Check if address is in blacklist
          if (blacklistMap[address.toLowerCase()]) {
            const label = blacklistMap[address.toLowerCase()];
            console.log("[MultiversX Blacklist] Found blacklisted address in span:", address, label);
            
            // Find the right parent element to highlight
            let parentToHighlight = span;
            
            // Try to find the parent cell or a more appropriate container for highlighting
            const parentCell = span.closest('td');
            if (parentCell) {
              parentToHighlight = parentCell;
            }
            
            highlightElement(parentToHighlight, label, address);
          }
        }
      });
      
      // 3. General check for any text containing erd1 addresses in table cells
      const tableCells = row.querySelectorAll('td');
      
      tableCells.forEach(cell => {
        // Skip cells we've already processed in the previous checks
        if (cell.classList.contains('blacklist-highlight')) {
          return;
        }
        
        const text = cell.textContent.trim();
        const addressMatch = text.match(/erd1[a-z0-9]{58,}/i);
        
        if (addressMatch) {
          const address = addressMatch[0];
          
          // Check if address is in blacklist
          if (blacklistMap[address.toLowerCase()]) {
            const label = blacklistMap[address.toLowerCase()];
            console.log("[MultiversX Blacklist] Found blacklisted address in cell text:", address, label);
            highlightElement(cell, label, address);
          }
        }
      });
    });
  }
}

// Function to highlight an element
function highlightElement(element, label, address) {
  // Modify the element's text and style
  const originalText = element.textContent;
  
  // If the element contains only the address, replace it with the label
  if (originalText.trim() === address) {
    element.innerHTML = `<span class="blacklist-highlight" title="Blacklisted: ${label}">⚠️ ${label} ${address}</span>`;
  } else {
    // If the element contains other text, append the warning
    element.innerHTML = `<span class="blacklist-highlight" title="Blacklisted: ${label}">⚠️ ${originalText}</span>  `;
  }
  
  // Apply the blacklist-highlight class
//   element.classList.add('blacklist-highlight');
  
  // Add a title for hover info
  element.title = `Blacklisted Address: ${label}`;
}

// Function to observe DOM changes for dynamically loaded content
function setupDOMObserver() {
  console.log("[MultiversX Blacklist] Setting up mutation observer for dynamic content...");
  
  // Create a MutationObserver instance
  const observer = new MutationObserver(function(mutations) {
    // Check if any mutation added a table or rows to a table
    let shouldCheck = false;
    
    mutations.forEach(mutation => {
      // If nodes were added
      if (mutation.addedNodes && mutation.addedNodes.length) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          
          // Check if the added node is an element and contains a table or is a table row
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.tagName === 'TABLE' || 
              node.tagName === 'TR' || 
              node.querySelector('table') || 
              node.querySelector('tr')
            ) {
              shouldCheck = true;
              break;
            }
          }
        }
      }
    });
    
    // If relevant nodes were added, run the highlighting function
    if (shouldCheck) {
      console.log("[MultiversX Blacklist] Detected dynamic content update, re-checking addresses...");
      highlightBlacklistedAddresses();
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,  // Observe direct children additions/removals
    subtree: true,    // Observe all descendants
    attributes: false // Don't track attribute changes
  });
  
  return observer;
}

// Run when the page loads initially
document.addEventListener('DOMContentLoaded', function() {
  console.log("[MultiversX Blacklist] DOM content loaded, running highlighter...");
  highlightBlacklistedAddresses();
  setupDOMObserver();
});

// If DOMContentLoaded has already fired, run immediately
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  console.log("[MultiversX Blacklist] Page already loaded, running highlighter immediately...");
  highlightBlacklistedAddresses();
  setupDOMObserver();
}
