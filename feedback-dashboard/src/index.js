export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Serve dashboard HTML
    if (url.pathname === '/' || url.pathname === '/dashboard') {
      return new Response(getDashboardHTML(), {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
    
    // API endpoints
    if (url.pathname === '/api/feedback') {
      if (request.method === 'GET') {
        return handleGetFeedback();
      }
      if (request.method === 'POST') {
        return handlePostFeedback(request);
      }
    }
    
    if (url.pathname === '/api/analyze' && request.method === 'GET') {
      return handleAnalyzeFeedback();
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// Simple in-memory storage
let feedbackData = [];

// Get dashboard HTML
function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Aggregator Dashboard</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      margin: 0; 
      padding: 20px; 
      background: #f0f2f5;
      min-height: 100vh;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    .header { 
      background: white; 
      padding: 25px; 
      border-radius: 15px; 
      margin-bottom: 30px; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { 
      color: #333; 
      margin: 0;
      font-size: 28px;
    }
    h1::before {
      content: "📊 ";
    }
    .card { 
      background: white; 
      padding: 25px; 
      margin-bottom: 25px; 
      border-radius: 15px; 
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    .metrics { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 25px; 
      margin-bottom: 30px; 
    }
    .metric-card { 
      background: white; 
      padding: 25px; 
      border-radius: 15px; 
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      text-align: center;
      transition: transform 0.3s ease;
    }
    .metric-card:hover {
      transform: translateY(-5px);
    }
    .metric-card h3 { 
      margin: 0 0 15px 0; 
      color: #666; 
      font-size: 14px; 
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .metric-card p { 
      font-size: 32px; 
      font-weight: bold; 
      margin: 0; 
      color: #333; 
    }
    .feedback-item { 
      border-left: 4px solid #667eea; 
      padding: 15px 20px; 
      margin: 15px 0; 
      background: #f8f9ff;
      border-radius: 0 10px 10px 0;
    }
    button { 
      background: #667eea;
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    button:hover { 
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    .sentiment { 
      display: inline-block; 
      padding: 4px 12px; 
      border-radius: 20px; 
      font-size: 12px; 
      font-weight: 600;
      margin-left: 10px; 
    }
    .positive { 
      background: #10b981; 
      color: white; 
    }
    .negative { 
      background: #ef4444; 
      color: white; 
    }
    .neutral { 
      background: #f59e0b; 
      color: white; 
    }
    .feedback-source { 
      font-weight: 600; 
      color: #4a5568;
      margin-bottom: 5px;
    }
    .feedback-text { 
      margin: 8px 0; 
      color: #2d3748;
      line-height: 1.5;
    }
    .feedback-meta { 
      font-size: 12px; 
      color: #718096; 
    }
    .controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    #clearBtn {
      background: #ef4444;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #718096;
    }
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Feedback Aggregator Dashboard</h1>
      <div class="controls">
        <button onclick="loadData()">🔄 Refresh</button>
        <button onclick="addMockFeedback()">➕ Add Sample</button>
        <button onclick="addMultipleFeedback()">🎲 Add 5 Samples</button>
        <button id="clearBtn" onclick="clearAllData()">🗑️ Clear All</button>
      </div>
    </div>
    
    <div class="metrics">
      <div class="metric-card">
        <h3>Total Feedback</h3>
        <p id="totalCount">0</p>
      </div>
      <div class="metric-card">
        <h3>Average Sentiment</h3>
        <p id="avgSentiment">0.00</p>
      </div>
      <div class="metric-card">
        <h3>Top Source</h3>
        <p id="topSource">No data</p>
      </div>
    </div>
    
    <div class="card">
      <h2>Recent Feedback</h2>
      <div id="feedbackList">
        <div class="empty-state">
          <h3>No feedback yet</h3>
          <p>Add some sample data to get started</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h3>Quick Stats</h3>
      <div id="stats" style="color: #718096; font-style: italic;">
        Add feedback to see statistics
      </div>
    </div>
  </div>
  
  <script>
    async function loadData() {
      try {
        // Load analytics
        const analyticsRes = await fetch('/api/analyze');
        const analytics = await analyticsRes.json();
        
        document.getElementById('totalCount').textContent = analytics.total;
        document.getElementById('avgSentiment').textContent = analytics.avgSentiment;
        document.getElementById('topSource').textContent = analytics.topSource || 'No data';
        
        // Load feedback
        const feedbackRes = await fetch('/api/feedback');
        const feedback = await feedbackRes.json();
        
        let html = '';
        if (feedback.length === 0) {
          html = '<div class="empty-state"><h3>No feedback yet</h3><p>Add some sample data to get started</p></div>';
        } else {
          feedback.forEach(item => {
            html += '<div class="feedback-item">';
            html += '<div class="feedback-source">' + item.source + 
                    '<span class="sentiment ' + item.sentiment + '">' + item.sentiment + '</span></div>';
            html += '<div class="feedback-text">' + item.text + '</div>';
            html += '<div class="feedback-meta">Urgency: ' + item.urgency + '/5 • ' + 
                    new Date(item.timestamp).toLocaleDateString() + ' ' + 
                    new Date(item.timestamp).toLocaleTimeString() + '</div>';
            html += '</div>';
          });
        }
        document.getElementById('feedbackList').innerHTML = html;
        
        // Update stats
        if (feedback.length > 0) {
          const sources = {};
          const sentiments = {};
          feedback.forEach(item => {
            sources[item.source] = (sources[item.source] || 0) + 1;
            sentiments[item.sentiment] = (sentiments[item.sentiment] || 0) + 1;
          });
          
          let statsHtml = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">';
          for (const [source, count] of Object.entries(sources)) {
            statsHtml += '<div>' + source + ': <strong>' + count + '</strong></div>';
          }
          for (const [sentiment, count] of Object.entries(sentiments)) {
            statsHtml += '<div>' + sentiment + ': <strong>' + count + '</strong></div>';
          }
          statsHtml += '</div>';
          document.getElementById('stats').innerHTML = statsHtml;
        }
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('feedbackList').innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">Error loading data. Please check console.</div>';
      }
    }
    
    async function addMockFeedback() {
      const sources = ['GitHub Issues', 'Discord Community', 'Email Support', 'Twitter', 'Community Forum', 'Support Tickets'];
      const sentiments = ['positive', 'negative', 'neutral'];
      const texts = [
        'The new API is fantastic! Great work team.',
        'Experiencing 500 errors when uploading large files.',
        'Could we get more documentation for the caching module?',
        'Customer support was incredibly helpful today.',
        'Mobile app crashes on iOS 17 when switching tabs.',
        'Feature request: Add webhook notifications for zone changes.',
        'Dashboard UI is very intuitive and user-friendly.',
        'Authentication timeout seems too short, keep getting logged out.'
      ];
      
      const mockData = {
        source: sources[Math.floor(Math.random() * sources.length)],
        text: texts[Math.floor(Math.random() * texts.length)],
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        urgency: Math.floor(Math.random() * 5) + 1,
        timestamp: new Date().toISOString()
      };
      
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockData)
        });
        
        loadData();
        showToast('✅ Feedback added successfully!');
      } catch (error) {
        console.error('Error adding feedback:', error);
        showToast('❌ Failed to add feedback', 'error');
      }
    }
    
    async function addMultipleFeedback() {
      showToast('Adding 5 sample feedback items...');
      for (let i = 0; i < 5; i++) {
        await addMockFeedback();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    async function clearAllData() {
      if (confirm('Are you sure you want to clear all feedback data? This cannot be undone.')) {
        // Clear local data
        const feedbackRes = await fetch('/api/feedback');
        const feedback = await feedbackRes.json();
        
        // For now, we'll just reload the page since data is in memory
        // In a real app, you'd call a DELETE endpoint
        location.reload();
      }
    }
    
    function showToast(message, type = 'success') {
      // Create toast element
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
      
      document.body.appendChild(toast);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    // Load data on page load
    loadData();
    
    // Auto-refresh every 30 seconds
    setInterval(loadData, 30000);
  </script>
</body>
</html>`;
}

// API Handlers
async function handleGetFeedback() {
  return new Response(JSON.stringify(feedbackData.slice().reverse()), {
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handlePostFeedback(request) {
  try {
    const data = await request.json();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const feedbackItem = {
      id,
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    };
    
    feedbackData.push(feedbackItem);
    
    return new Response(JSON.stringify({ success: true, id }), {
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleAnalyzeFeedback() {
  if (feedbackData.length === 0) {
    return new Response(JSON.stringify({
      total: 0,
      avgSentiment: 0.00,
      topSource: null
    }), {
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // Calculate metrics
  const sources = {};
  const sentimentValues = { positive: 1, neutral: 0, negative: -1 };
  let totalSentiment = 0;
  
  feedbackData.forEach(item => {
    sources[item.source] = (sources[item.source] || 0) + 1;
    totalSentiment += sentimentValues[item.sentiment] || 0;
  });
  
  const topSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0];
  
  return new Response(JSON.stringify({
    total: feedbackData.length,
    avgSentiment: (totalSentiment / feedbackData.length).toFixed(2),
    topSource: topSource ? topSource[0] + ' (' + topSource[1] + ')' : null
  }), {
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}