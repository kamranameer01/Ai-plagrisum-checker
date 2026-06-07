# Ai-plagrisum-checker
PlagiGuard AI Plagiarism Checker – Code & Functionality Report
Date: June 7, 2026
Reviewed by: Code Analysis Team
Application Type: Front-end web application (HTML/CSS/JS) with external plagiarism detection API
Target Environment: Modern browsers (Chrome, Firefox, Safari, Edge)

1. Executive Summary
PlagiGuard is a front-end web interface for an AI‑powered plagiarism checker. Users can paste text, receive an originality score, view matched sources, and obtain a risk assessment. The application features a modern responsive layout, dark mode, word/character counters, pricing tables, FAQs, and interactive UI components. The core scanning logic relies on an external API (exposed via a ngrok tunnel). While the visual design and basic functionality are solid, several interactive features are incomplete, and the current API endpoint is a temporary development proxy that would not be suitable for production. This report evaluates strengths, identifies missing implementations, and provides actionable recommendations.

2. Application Overview
Aspect	Description
Purpose	Detect duplicate content and generate originality reports for students, writers, and professionals
Primary Feature	Text pasting → API request → similarity percentage + matched sources + originality score
Secondary Features	Word/char counter, dark mode, responsive design, pricing tables, testimonials, FAQ accordion
Tech Stack	HTML5, CSS3 (CSS variables, Flex/Grid, animations), Vanilla JavaScript (ES6)
3. Front-End Code Architecture
3.1 File Structure & Separation
index.html – semantic layout, uses <section> with appropriate IDs, embeds font links and meta tags.

style.css – well‑organized, CSS custom properties for theming, responsive breakpoints, subtle hover effects, glassmorphism (backdrop-filter).

script.js – DOMContentLoaded initialisation, dark mode toggle, word/char counting, API call logic, result rendering.

3.2 Code Quality Observations
Strengths	Weaknesses / Technical Debt
✅ Uses localStorage to persist dark mode preference	❌ startScan is exposed as a global function (pollutes window)
✅ Event listeners attached in DOMContentLoaded	❌ No modularisation (e.g., no ES modules or class separation)
✅ Graceful fallback for missing DOM elements	❌ Inconsistent event binding: scanBtn uses inline onclick + potential duplication
✅ Responsive navbar with mobile toggle (CSS + JS missing?)	❌ Mobile menu toggle defined in CSS but no JS to open/close
✅ Clean separation of update functions (setCounts, setRingProgress)	❌ Hardcoded API URL with ngrok – not environment‑aware
4. Core Features Evaluation
Feature	Implementation Status	Notes
Plagiarism Scan	✅ Functional – sends text to /scan endpoint, displays originality/duplicate %, ring progress, sources list. Uses ngrok-skip-browser-warning header.	No caching, no offline fallback. Endpoint must be available.
Word / Char Counter	✅ Live updates on text input; counts shown in hero stats.	Works correctly.
Clear Editor	✅ Resets textarea, hides result and loader panels.	Good UX.
Dark Mode	✅ Fully implemented, persists to localStorage, toggles data-theme on <html>.	Styles properly adjust all components.
Result Ring Progress	✅ Dynamically updates stroke‑dashoffset based on originality percentage.	Uses setRingProgress() – smooth visual feedback.
Matched Sources	✅ Renders list from API response (if data.sources is an array). Graceful fallback message when empty.	Design requires API to return url and similarity fields.
5. API Integration & Backend Communication
5.1 Endpoint & Request Format
URL: https://b6f3-35-237-97-40.ngrok-free.app/scan

Method: POST

Headers: Content-Type: application/json, ngrok-skip-browser-warning: 69420

Body: { "content": userText }

5.2 Expected Response Structure (derived from script)
json
{
  "overall_similarity": 32,
  "similarity_percentage": 32,
  "risk_level": "LOW",
  "sources": [
    { "url": "https://example.com/page", "similarity": 28 }
  ]
}
5.3 Error Handling
✅ Network errors / non‑ok responses → alert() with error message.

✅ Minimum 30‑character validation before sending request.

❌ No retry logic or exponential backoff.

❌ No loading timeout; if API hangs, loader remains indefinitely.

❌ API token / authentication not implemented – anyone can call the endpoint.

5.4 Production Concerns
The ngrok URL is temporary, unauthenticated, and exposes the backend directly.

No CORS configuration details – current header works but would need proper CORS setup on the real backend.

Highly recommended to proxy API calls through a server‑side endpoint to protect API keys and rate‑limit users.

6. User Experience (UX) & Interactive Components
6.1 Completed Interactive Elements
Scan button, clear button, dark mode toggle.

Real‑time counters.

Scroll‑to‑results after scan (resultPanel.scrollIntoView).

Pricing cards with hover effects.

6.2 Incomplete / Missing Functionality
Component	Expected Behaviour	Current State
Mobile nav toggle	Hamburger button opens/closes navigation links on small screens	❌ No JavaScript attached to .nav-toggle; menu never opens.
Testimonial slider	Rotate testimonials automatically or with arrows/dots	❌ All three cards present, only first has active class; no rotation logic.
FAQ Accordion	Click question → expand answer with smooth animation	❌ Accordion panels never open; no event listeners on .accordion-button.
Tool list sidebar	Clicking tool should switch active state and change main content	❌ Only static list with fake checkmarks; no filtering or tool switching.
File upload	Upload PDF/DOC/DOCX/TXT and extract text for scanning	❌ Only textarea supported – file input missing entirely; UI references a non‑existent .file-upload element.
Hero “Check Now” button	Should trigger plagiarism scan (same as Analyze button)	❌ No event listener attached to #heroCheckBtn.
Active tool display	#activeTool span should reflect current tool (e.g., “Plagiarism Checker”)	❌ Static text; never updated.
6.3 Accessibility
✅ Semantic HTML (<main>, <section>, <article>, <header>).

✅ aria-label on dark mode toggle, nav toggle.

❌ No keyboard navigation testing for accordion or slider.

❌ Missing alt attributes for images (no images present, but future additions should consider).

7. Responsive Design & Dark Mode
Aspect	Evaluation
Breakpoints	960px and 640px – grid switches to single column, mobile menu adjustments.
Dark Mode	Full CSS variable override; smooth transition on background, text, borders, cards. Works correctly across all major components.
Typography	clamp() for headings, Inter + Poppins fonts. Good readability.
Glassmorphism	backdrop-filter: blur(18px) on .glass-card – modern, but may impact performance on low‑end devices. Fallback background is provided.
Note: The mobile navigation toggle (display: none → inline-flex at ≤960px) is styled but uninteractive – critical for mobile users.

8. Issues & Missing Functionality (Detailed)
8.1 Incomplete JavaScript Behaviours
Accordion – no event listeners initialised.

Testimonial slider – no automatic or manual rotation.

Tool switching – no logic to change active tool or update the central content.

File upload – despite HTML mentioning “Multi-Format Support”, there is no <input type="file"> or file reading logic.

8.2 API & Data Handling
The script uses both data.overall_similarity and data.similarity_percentage – flexible but ambiguous. Would be safer to define a single field.

riskLevel defaults to "LOW" if originality > 75, otherwise "HIGH". This logic is fine, but the API could also send its own risk level.

No persistent scan history or report saving.

8.3 Potential Bugs
setRingProgress uses const ring = document.querySelector('.ring') but inside the function it assumes ring is globally accessible (it is, but variable is defined outside). That works, but if the DOM changes, query would fail. Suggestion: store reference once.

liveWords element referenced but does not exist in the HTML → if(liveWords) liveWords.textContent = words; prevents error, but a missing element suggests incomplete component.

After clearing, the result panel becomes hidden, but the ring progress remains at previous value (not reset to 0%). Minimal visual glitch.

9. Security Considerations
Issue	Risk Level	Recommendation
API endpoint exposed on ngrok	High	Deploy real backend with proper authentication, rate limiting, and HTTPS.
No content sanitisation	Medium	User‑supplied text sent directly to API; ensure backend validates input size and escapes output.
No CSRF protection on API requests	Low	For production, implement token‑based authentication.
Script depends on external API availability	Medium	Add timeout (e.g., 15 seconds) and user‑friendly error messages.
10. Performance Analysis
Lighthouse potential (expected):

Performance: Good – small JS payload, no external libraries, CSS optimised.

Accessibility: Moderate – missing keyboard controls for interactive widgets.

Best Practices: Good except for mixed content concerns (if deployed over HTTP).

Memory/CPU: The plagiarism scan is a single fetch; no heavy computation on client side.

Bundle size: Minimal – all code inline or separate files (< 50 KB total).

Recommendation: Lazy‑load heavy sections (e.g., testimonials, pricing) if page becomes larger.

11. Recommendations (Prioritised)
High Priority (Must Fix for Production)
Implement mobile navigation toggle – add event listener to .nav-toggle that toggles .open class on .nav-links.

Add file upload support – create hidden file input, use FileReader to extract text from PDF/DOCX (requires additional library like pdf.js or mammoth.js) or send file directly to API.

Attach event listeners for:

#heroCheckBtn → trigger startScan.

Accordion buttons → expand/collapse panels.

Testimonial slider → simple auto‑rotation or dot controls.

Replace ngrok endpoint with a real domain and implement authentication (API key or user login).

Medium Priority (Polish & UX)
Add loading timeout & retry logic – show “Server taking too long” after 12 seconds.

Reset ring progress on clearBtn click (set stroke-dashoffset to 326, ring text to “0%”).

Remove global startScan – attach event listener properly inside DOMContentLoaded to avoid accidental calls.

Implement tool switching – at minimum, highlight active tool and display a description; for full functionality, each tool would need its own API endpoint.

Low Priority (Nice to Have)
Implement “Learn More” button – scroll to #features or show tooltip.

Add export options – download report as PDF or JSON.

Improve testimonial slider – add left/right arrows and accessibility roles.

12. Conclusion
PlagiGuard delivers a visually compelling and partially functional plagiarism checking experience. The front‑end design is modern, dark mode works seamlessly, and the core scanning flow (paste → API → results) is operational when the ngrok backend is running. However, numerous interactive components (mobile menu, FAQ accordion, testimonial slider, tool switching, file upload) are incomplete, limiting the product’s professional readiness. The reliance on a public ngrok URL also makes the current version unsuitable for production deployment.

Final Verdict:
✅ A strong prototype / MVP with excellent design.
❌ Requires moderate to significant front‑end and backend work before a public launch.

With the recommended fixes – especially completing the interactive widgets and moving to a stable backend – PlagiGuard can become a reliable, market‑ready plagiarism detection tool.
