document.addEventListener('DOMContentLoaded', function() {
  const addressInput = document.getElementById('address');
  const labelInput = document.getElementById('label');
  const addButton = document.getElementById('add-to-blacklist');
  const blacklistContainer = document.getElementById('blacklist-items');
  const searchInput = document.getElementById('search-blacklist');
  const addressesCount = document.getElementById('addresses-count');
  
  // Load the blacklist from storage
  loadBlacklist();
  
  // Add event listener for the add button
  addButton.addEventListener('click', function() {
    const address = addressInput.value.trim();
    const label = labelInput.value.trim();
    
    // Simple validation
    if (!address) {
      alert('Please enter an address.');
      return;
    }
    
    if (!address.startsWith('erd1')) {
      alert('Please enter a valid MultiversX address starting with "erd1".');
      return;
    }
    
    if (!label) {
      alert('Please enter a label.');
      return;
    }
    
    // Add to blacklist
    addToBlacklist(address, label);
    
    // Clear inputs
    addressInput.value = '';
    labelInput.value = '';
  });
  
  // Add event listener for the search input
  searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    filterBlacklist(searchTerm);
  });
  
  // Export blacklist as JSON file
  document.getElementById('export-blacklist').addEventListener('click', function() {
    chrome.storage.sync.get('blacklist', function(data) {
      const blacklist = data.blacklist || [];
      const blob = new Blob([JSON.stringify(blacklist, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'multiversx-blacklist.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    });
  });

  // Import blacklist from JSON file
  document.getElementById('import-blacklist').addEventListener('click', function() {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        // Validate structure
        const valid = imported.every(item => item.address && item.label);
        if (!valid) throw new Error('Invalid format');
        // Merge with current blacklist, avoiding duplicates
        chrome.storage.sync.get('blacklist', function(data) {
          const current = data.blacklist || [];
          const merged = [...current];
          imported.forEach(newItem => {
            if (!merged.some(item => item.address.toLowerCase() === newItem.address.toLowerCase())) {
              merged.push(newItem);
            }
          });
          chrome.storage.sync.set({ blacklist: merged }, function() {
            updateBlacklistUI(merged);
            alert('Blacklist imported successfully!');
          });
        });
      } catch (err) {
        alert('Failed to import: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be imported again if needed
    event.target.value = '';
  });

  // Function to load the blacklist from storage
  function loadBlacklist() {
    chrome.storage.sync.get('blacklist', function(data) {
      const blacklist = data.blacklist || [];
      updateBlacklistUI(blacklist);
    });
  }
  
  // Function to add an address to the blacklist
  function addToBlacklist(address, label) {
    chrome.storage.sync.get('blacklist', function(data) {
      const blacklist = data.blacklist || [];
      
      // Check if address already exists
      const exists = blacklist.some(item => item.address.toLowerCase() === address.toLowerCase());
      
      if (exists) {
        alert('This address is already in your watchlist.');
        return;
      }
      
      // Add new address
      blacklist.push({
        address: address,
        label: label
      });
      
      // Save updated blacklist
      chrome.storage.sync.set({blacklist: blacklist}, function() {
        updateBlacklistUI(blacklist);
      });
    });
  }
  
  // Function to remove an address from the blacklist
  function removeFromBlacklist(address) {
    chrome.storage.sync.get('blacklist', function(data) {
      const blacklist = data.blacklist || [];
      
      // Filter out the address to remove
      const updatedBlacklist = blacklist.filter(item => item.address !== address);
      
      // Save updated blacklist
      chrome.storage.sync.set({blacklist: updatedBlacklist}, function() {
        updateBlacklistUI(updatedBlacklist);
      });
    });
  }
  
  // Function to update the UI with the current blacklist
  function updateBlacklistUI(blacklist) {
    // Update count
    addressesCount.textContent = blacklist.length;
    
    // Clear the container
    blacklistContainer.innerHTML = '';
    
    // If empty, show message
    if (blacklist.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No addresses in watchlist yet.';
      blacklistContainer.appendChild(emptyMessage);
      return;
    }
    
    // Sort blacklist by label alphabetically
    blacklist.sort((a, b) => a.label.localeCompare(b.label));
    
    // Add each item to the UI
    blacklist.forEach(function(item) {
      const itemElement = document.createElement('div');
      itemElement.className = 'blacklist-item';
      
      const itemInfo = document.createElement('div');
      itemInfo.className = 'item-info';
      
      const labelElement = document.createElement('div');
      labelElement.className = 'label';
      labelElement.textContent = item.label;
      
      const addressElement = document.createElement('div');
      addressElement.className = 'address';
      addressElement.textContent = item.address;
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-btn';
      deleteButton.textContent = 'Remove';
      deleteButton.addEventListener('click', function() {
        removeFromBlacklist(item.address);
      });
      
      itemInfo.appendChild(labelElement);
      itemInfo.appendChild(addressElement);
      itemElement.appendChild(itemInfo);
      itemElement.appendChild(deleteButton);
      
      blacklistContainer.appendChild(itemElement);
    });
  }
  
  // Function to filter the blacklist based on search term
  function filterBlacklist(searchTerm) {
    chrome.storage.sync.get('blacklist', function(data) {
      const blacklist = data.blacklist || [];
      
      if (searchTerm === '') {
        // If search is empty, show all
        updateBlacklistUI(blacklist);
        return;
      }
      
      // Filter based on address or label
      const filteredList = blacklist.filter(item => 
        item.address.toLowerCase().includes(searchTerm) || 
        item.label.toLowerCase().includes(searchTerm)
      );
      
      // Update UI with filtered list
      blacklistContainer.innerHTML = '';
      
      if (filteredList.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No matching addresses found.';
        blacklistContainer.appendChild(emptyMessage);
        return;
      }
      
      // Sort and display filtered items
      filteredList.sort((a, b) => a.label.localeCompare(b.label));
      
      filteredList.forEach(function(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'blacklist-item';
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'label';
        labelElement.textContent = item.label;
        
        const addressElement = document.createElement('div');
        addressElement.className = 'address';
        addressElement.textContent = item.address;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Remove';
        deleteButton.addEventListener('click', function() {
          removeFromBlacklist(item.address);
        });
        
        itemInfo.appendChild(labelElement);
        itemInfo.appendChild(addressElement);
        itemElement.appendChild(itemInfo);
        itemElement.appendChild(deleteButton);
        
        blacklistContainer.appendChild(itemElement);
      });
    });
  }
});
