document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle
  const darkModeToggle = document.querySelector('#darkModeToggle');
  const htmlElement = document.documentElement;
  
  // Load saved theme preference or check system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    darkModeToggle.textContent = savedTheme === 'dark' ? 'Dark' : 'Light';
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    htmlElement.setAttribute('data-theme', 'dark');
    darkModeToggle.textContent = 'Dark';
  }
  
  darkModeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    darkModeToggle.textContent = newTheme === 'dark' ? 'Dark' : 'Light';
  });

  const textInput = document.querySelector('#inputText');
  const wordCount = document.querySelector('#wordCount');
  const charCount = document.querySelector('#charCount');
  const liveWords = document.querySelector('#liveWords');
  const clearBtn = document.querySelector('#clearBtn');
  const loaderPanel = document.querySelector('#loaderPanel');
  const loaderSteps = document.querySelector('#loaderSteps');
  const resultPanel = document.querySelector('#resultPanel');
  const ring = document.querySelector('.ring');
  const ringText = document.querySelector('#ringText');
  const sourceList = document.querySelector('#sourceList');

  const API_URL = "https://b6f3-35-237-97-40.ngrok-free.app/scan";

  const setCounts = (text) => {
    const chars = text.length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    if (wordCount) wordCount.textContent = words;
    if (charCount) charCount.textContent = chars;
    if (liveWords) liveWords.textContent = words;
  };

  const setRingProgress = (percent) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    ringText.textContent = `${percent}%`;
  };

  window.startScan = async () => {
    const text = textInput.value.trim();

    if (text.length < 30) {
      alert("Please paste at least 30 characters to scan.");
      return;
    }

    resultPanel.classList.add('hidden');
    loaderPanel.classList.remove('hidden');
    setRingProgress(0);
    loaderSteps.innerHTML = '<p>Analyzing content...</p>';

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420" 
        },
        body: JSON.stringify({ content: text })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      // ✅ SAFE DATA EXTRACTION
      const similarity = data.overall_similarity ?? 
                         data.similarity_percentage ?? 0;

      const originality = 100 - similarity;
      const riskLevel = data.risk_level || 
                        (originality > 75 ? "LOW" : "HIGH");

      document.querySelector('#originalityScore').textContent = `${originality}%`;
      document.querySelector('#duplicateScore').textContent = `${similarity}%`;
      document.querySelector('#scanStatus').textContent = "Completed";
      document.querySelector('#riskLevel').textContent = riskLevel;

      setRingProgress(originality);

      // ✅ SAFE SOURCES HANDLING
      const sources = Array.isArray(data.sources) ? data.sources : [];

      if (sources.length > 0) {
        sourceList.innerHTML = sources.map(s => `
          <li style="margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <span style="color: var(--primary); font-weight: 700; display:block; margin-bottom:4px;">
              ${s.url || "Dataset Match"}
            </span>
            <span style="font-size: 0.85rem; color: var(--text-dim);">
              Similarity: <strong>${s.similarity || similarity}%</strong>
            </span>
          </li>
        `).join('');
      } else {
        sourceList.innerHTML = `
          <li style="color: var(--text-dim); text-align: center; padding: 20px;">
            No matching sources found. Content appears unique.
          </li>`;
      }

      loaderPanel.classList.add('hidden');
      resultPanel.classList.remove('hidden');
      resultPanel.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      alert(`System Error: ${err.message}`);
      loaderPanel.classList.add('hidden');
    }
  };

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      setCounts("");
      resultPanel.classList.add('hidden');
      loaderPanel.classList.add('hidden');
    });
  }

  textInput.addEventListener('input', () => setCounts(textInput.value));
  setCounts("");
});