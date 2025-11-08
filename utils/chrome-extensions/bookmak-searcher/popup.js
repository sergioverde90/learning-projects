let allBookmarks = [];

// Get all bookmarks on load
chrome.bookmarks.getTree((bookmarkTreeNodes) => {
  allBookmarks = [];
  extractBookmarks(bookmarkTreeNodes);
  displayBookmarks(allBookmarks);
});

function extractBookmarks(nodes) {
  for (let node of nodes) {
    if (node.url) {
      allBookmarks.push({
        id: node.id,
        title: node.title,
        url: node.url
      });
    }
    if (node.children) {
      extractBookmarks(node.children);
    }
  }
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function displayBookmarks(bookmarks) {
  const resultsDiv = document.getElementById('results');
  const countDiv = document.getElementById('count');
  const searchQuery = document.getElementById('searchInput').value;
  
  countDiv.textContent = bookmarks.length === 0 ? '' : 
    `${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'} found`;
  
  if (bookmarks.length === 0) {
    resultsDiv.innerHTML = '<div class="no-results">No bookmarks found</div>';
    return;
  }
  
  resultsDiv.innerHTML = bookmarks.map(bookmark => {
    const favicon = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`;
    const highlightedTitle = highlightText(bookmark.title, searchQuery);
    
    return `
      <div class="bookmark-item" data-url="${bookmark.url}">
        <img src="${favicon}" class="bookmark-icon" onerror="this.style.display='none'">
        <div class="bookmark-info">
          <div class="bookmark-title">${highlightedTitle}</div>
          <div class="bookmark-url">${bookmark.url}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.bookmark-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.getAttribute('data-url');
      chrome.tabs.create({ url });
    });
  });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    displayBookmarks(allBookmarks);
    return;
  }
  
  const filtered = allBookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(query) ||
    bookmark.url.toLowerCase().includes(query)
  );
  
  displayBookmarks(filtered);
});

// Allow Enter key to open first result
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const firstItem = document.querySelector('.bookmark-item');
    if (firstItem) {
      firstItem.click();
    }
  }
});