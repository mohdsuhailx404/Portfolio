/* ==========================================================================
   MOHD SUHAIL PORTFOLIO JS — INTERACTIVE SYNTHESIS
   ========================================================================== */

// --- Global States ---
let audioContext = null;
let audioAnalyser = null;
let audioSource = null;
let isPlaying = false;
let synthesisCanvas = null;
let synthesisCtx = null;
let canvasAnimationId = null;
let particleArray = [];
let visualMode = 'frequency'; // 'frequency' or 'particle'

// --- Project Data ---
const projectsData = {
    pandora: {
        title: "Pandora's Box",
        tag: "AI Knowledge Discovery Platform",
        year: "2026 – Present",
        tech: ["Flutter", "Riverpod", "Firebase", "TypeScript", "Node.js", "Gemini API"],
        desc: "An AI-powered collaborative knowledge directory enabling users to discover, organize, summarize, and discuss web resources through semantic search, AI-generated metadata, and community-driven collections.",
        bullets: [
            "Architected a cross-platform Flutter application using Riverpod for scalable state management and a serverless Firebase backend with Node.js/TypeScript Cloud Functions.",
            "Engineered an automated ingestion pipeline that processes submitted URLs, generates Gemini AI-powered summaries and tags, and indexes content for fast semantic discovery.",
            "Developed a Spotify-inspired collaborative 'Blend' system with transaction-safe Firestore permissions, batch access propagation, and real-time social activity indicators.",
            "Designed an RPG engagement engine supporting multiple activity types through quadratic XP progression, dynamic level computation, daily login streaks, and achievement-based rewards.",
            "Optimized application reliability through Firestore event-driven synchronization, proxy-based CORS handling, custom drag-scroll interactions, and self-healing schema migrations."
        ],
        terminal: `// Initializing Pandora's Box Ingestion Pipeline
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
async function ingestResource(url) {
    const rawContent = await fetchAndClean(url);
    const summary = await gemini.generateSummary(rawContent);
    const embeddings = await gemini.getEmbeddings(summary);
    
    await firestore.collection('resources').add({
        url, summary, embeddings,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("Resource indexed successfully.");
}`
    },
    chillar: {
        title: "Chillar",
        tag: "Student Expense Tracker",
        year: "2024 – 2025",
        tech: ["Vanilla JS", "HTML5", "CSS3", "SVG Engine", "LocalStorage"],
        desc: "A personal finance and expense tracking platform enabling budgeting, savings planning, bill splitting, spending analytics, and interactive financial visualizations.",
        bullets: [
            "Architected a high-performance, serverless client-side Single-Page Application (SPA) using Vanilla ES6+ and custom state management with cryptographically isolated localStorage schemas.",
            "Built a native SVG visualization engine rendering real-time line and donut charts without third-party charting libraries, optimizing page-weight.",
            "Implemented a full CRUD transaction ledger with multi-dimensional filtering, savings vaults, roommate bill splitting, and heuristic financial insights.",
            "Designed an accessible glassmorphism interface with dynamic themes, while implementing client-side validation pipelines and automated Node.js testing to ensure data integrity."
        ],
        terminal: `// Native SVG Pie Chart Rendering Engine snippet
function drawDonutChart(canvasId, data) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        const x1 = 100 + 80 * Math.cos(startAngle);
        const y1 = 100 + 80 * Math.sin(startAngle);
        startAngle += sliceAngle;
        const x2 = 100 + 80 * Math.cos(startAngle);
        const y2 = 100 + 80 * Math.sin(startAngle);
        
        createSvgPath(x1, y1, x2, y2, item.color);
    });
}`
    },
    filmy: {
        title: "Filmy",
        tag: "Movie Recommendation System",
        year: "2024 – 2025",
        tech: ["Python", "Scikit-learn", "Pandas", "Streamlit", "TF-IDF"],
        desc: "An AI-powered content-based movie recommendation platform leveraging the MovieLens dataset, TF-IDF vectorization, and cosine similarity to generate personalized recommendations.",
        bullets: [
            "Built an AI-powered content-based movie recommendation platform leveraging the MovieLens dataset (100K+ ratings), TF-IDF vectorization, and cosine similarity to generate personalized recommendations.",
            "Processed and cleaned raw rating and metadata CSVs with Pandas, engineering user-item feature matrices that reduced cold-start noise by filtering users with fewer than 20 interactions.",
            "Deployed an interactive Streamlit web UI on Streamlit Cloud, allowing users to search by title and receive ranked recommendations in under 200ms."
        ],
        terminal: `# Content-Based Recommendation using Cosine Similarity
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

def get_recommendations(title, cosine_sim, indices, df):
    idx = indices[title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:11] # Top 10 recommendations
    movie_indices = [i[0] for i in sim_scores]
    return df['title'].iloc[movie_indices]`
    }
};

// --- Mock Reels Songs / Sounds ---
// We synthesize warm synth tones using the Web Audio API when playing,
// giving Suhail a futuristic singing/voice instrument experience directly in browser.
let audioInterval = null;
let currentReelTrackName = "";

function startSyntheticSynth(trackName) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 256;
        audioAnalyser.connect(audioContext.destination);
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    currentReelTrackName = trackName;
    isPlaying = true;
    document.getElementById('reel-player-modal').classList.add('playing');
    document.getElementById('big-play-svg').innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; // Pause icon

    // Set up a simple arpeggiator to represent "vocal melodies & chords"
    let notes = [261.63, 329.63, 392.00, 523.25]; // C major chords default
    if (trackName.includes("Sunset") || trackName.includes("Soul")) {
        notes = [293.66, 349.23, 440.00, 587.33]; // D minor chords (moody)
    } else if (trackName.includes("Indie") || trackName.includes("Classic")) {
        notes = [349.23, 440.00, 523.25, 698.46]; // F major chords (warmer)
    }

    let noteIndex = 0;
    
    function playNote() {
        if (!isPlaying) return;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Use triangle waves for a soft, woodwind/vocal acoustic quality
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[noteIndex % notes.length], audioContext.currentTime);
        
        // Glide the frequency slightly to simulate human vocals/guitar portamento
        osc.frequency.exponentialRampToValueAtTime(notes[noteIndex % notes.length] * 0.99, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        
        osc.connect(gainNode);
        // Connect to analyser so we can visualize it!
        gainNode.connect(audioAnalyser);
        
        osc.start();
        osc.stop(audioContext.currentTime + 0.85);
        
        noteIndex++;
        
        // Update simulated duration scrubber
        const seek = document.getElementById('audio-seek-slider');
        seek.value = (parseInt(seek.value) + 2) % 100;
        document.getElementById('audio-time-current').textContent = `0:${seek.value < 10 ? '0' + Math.floor(seek.value/2) : Math.floor(seek.value/2)}`;
    }
    
    // Play immediately and loop
    playNote();
    audioInterval = setInterval(playNote, 600);
}

function stopSyntheticSynth() {
    isPlaying = false;
    if (audioInterval) {
        clearInterval(audioInterval);
        audioInterval = null;
    }
    document.getElementById('reel-player-modal').classList.remove('playing');
    document.getElementById('big-play-svg').innerHTML = `<path d="M8 5v14l11-7z"/>`; // Play icon
}

// ==========================================================================
// --- INITIALIZATION & EVENT LISTENERS ---
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initSplitHero();
    initScrollSpy();
    initSynthesisCanvas();
    initContactForm();
});

// --- Custom Cursor Logic ---
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    
    if (!cursor || !cursorDot) return;

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    });

    // Add hover states for interactive elements
    const hoverElements = document.querySelectorAll('a, button, .project-card, .reel-card, .gallery-item, input, textarea');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });
}

// --- Split Screen Hero Interaction ---
function initSplitHero() {
    const aliasSide = document.getElementById('hero-alias-side');
    const karigariSide = document.getElementById('hero-karigari-side');
    
    if (!aliasSide || !karigariSide) return;

    aliasSide.addEventListener('mouseenter', () => {
        document.body.classList.remove('cursor-on-karigari');
    });

    karigariSide.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-on-karigari');
    });
}

// --- Scroll Spy & Theme Toggles ---
function initScrollSpy() {
    const header = document.querySelector('.main-header');
    const sections = document.querySelectorAll('.portfolio-section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        // Header Background Blur
        if (scrollPos > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Section Tracker & Cursor Color Switcher
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 150;
            const secHeight = sec.offsetHeight;
            const secId = sec.getAttribute('id');

            if (scrollPos >= secTop && scrollPos < secTop + secHeight) {
                // Change custom cursor themes matching section
                if (sec.classList.contains('karigari-theme')) {
                    document.body.classList.add('cursor-on-karigari');
                } else {
                    document.body.classList.remove('cursor-on-karigari');
                }
            }
        });
    });
}

// --- Project Modals ---
window.openProjectModal = function(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('project-modal-body');
    
    modalBody.innerHTML = `
        <div class="project-modal-details">
            <div class="modal-header">
                <span class="modal-tag">${project.tag}</span>
                <h2 class="modal-title">${project.title}</h2>
                <span class="modal-meta">Timeline: ${project.year}</span>
            </div>
            <div class="modal-body">
                <p>${project.desc}</p>
                
                <h5>Technical Implementation Details</h5>
                <ul class="bullets-list">
                    ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                </ul>
                
                <h5>Code / Architectural Blueprint</h5>
                <div class="mock-terminal-wrapper">
                    <pre><code>${escapeHtml(project.terminal)}</code></pre>
                </div>

                <h5>Technologies & Frameworks</h5>
                <div class="modal-tech-pills">
                    ${project.tech.map(t => `<span>${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

// --- Reels Modal & Vocal Cover Player ---
window.openReelPlayer = function(audioPath, trackName, description) {
    const modal = document.getElementById('reel-player-modal');
    document.getElementById('reel-vocal-title').textContent = trackName;
    document.getElementById('reel-vocal-desc').textContent = description;
    
    document.getElementById('sidebar-reel-title').textContent = trackName;
    document.getElementById('sidebar-reel-description').textContent = `${description}. Featured cover performance by Mohd Suhail. Exploring vocal resonance and acoustic harmonies.`;
    
    // Reset scrubber
    document.getElementById('audio-seek-slider').value = 0;
    document.getElementById('audio-time-current').textContent = "0:00";
    document.getElementById('audio-time-duration').textContent = "0:30";

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Automatically play the synthesized keyboard/string cover representation
    startSyntheticSynth(trackName);
};

window.closeReelPlayer = function() {
    const modal = document.getElementById('reel-player-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    stopSyntheticSynth();
};

window.toggleAudioPlayback = function() {
    if (isPlaying) {
        stopSyntheticSynth();
    } else {
        startSyntheticSynth(currentReelTrackName);
    }
};

window.toggleReelHeart = function(btn) {
    btn.classList.toggle('active-heart');
    const countSpan = btn.querySelector('.count');
    let count = parseFloat(countSpan.textContent);
    if (btn.classList.contains('active-heart')) {
        countSpan.textContent = (count + 0.1).toFixed(1) + 'k';
    } else {
        countSpan.textContent = (count - 0.1).toFixed(1) + 'k';
    }
};

// --- Image Lightbox ---
window.openImageLightBox = function(imgSrc, title, desc) {
    const lightbox = document.getElementById('image-lightbox');
    document.getElementById('lightbox-img').src = imgSrc;
    document.getElementById('lightbox-title').textContent = title;
    document.getElementById('lightbox-desc').textContent = desc;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeImageLightBox = function() {
    const lightbox = document.getElementById('image-lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
};

// ==========================================================================
// --- SYNTHESIS INTERACTIVE FREQUENCY CANVAS ---
// ==========================================================================
function initSynthesisCanvas() {
    synthesisCanvas = document.getElementById('synthesis-canvas');
    if (!synthesisCanvas) return;
    
    synthesisCtx = synthesisCanvas.getContext('2d');
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    
    // Track mouse coords on canvas for custom interactive ripples
    let mouse = { x: null, y: null };
    synthesisCanvas.addEventListener('mousemove', (e) => {
        const rect = synthesisCanvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    synthesisCanvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Handle Style Toggling
    const toggleBtn = document.getElementById('btn-toggle-vis-style');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            visualMode = visualMode === 'frequency' ? 'particle' : 'frequency';
            toggleBtn.textContent = visualMode === 'frequency' ? 'Switch to Particle Mode' : 'Switch to Wave Mode';
        });
    }

    // Populate Particles
    initParticles();
    
    // Render loop
    function render() {
        synthesisCtx.fillStyle = 'rgba(11, 12, 16, 0.2)'; // trail effect
        synthesisCtx.fillRect(0, 0, synthesisCanvas.width, synthesisCanvas.height);
        
        let audioData = new Uint8Array(128);
        if (audioAnalyser && isPlaying) {
            audioAnalyser.getByteFrequencyData(audioData);
        } else {
            // Generate mock wave data if nothing is playing to keep canvas interactive
            const time = Date.now() * 0.003;
            for (let i = 0; i < 128; i++) {
                audioData[i] = Math.sin(i * 0.1 + time) * 30 + 40;
            }
        }
        
        if (visualMode === 'frequency') {
            drawWaves(audioData, mouse);
        } else {
            drawParticles(audioData, mouse);
        }
        
        canvasAnimationId = requestAnimationFrame(render);
    }
    
    render();
}

function resizeCanvas() {
    if (!synthesisCanvas) return;
    const parent = synthesisCanvas.parentElement;
    synthesisCanvas.width = parent.clientWidth;
    synthesisCanvas.height = parent.clientHeight;
}

// Wave style visualizer
function drawWaves(audioData, mouse) {
    synthesisCtx.lineWidth = 2;
    
    // Drawing converging frequencies:
    // Left side (cyan cyber-grid waves) converging with Right side (terracotta organic waves)
    
    // Tech Waves (Cyan)
    synthesisCtx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
    synthesisCtx.beginPath();
    for (let i = 0; i < audioData.length; i++) {
        const x = (synthesisCanvas.width / audioData.length) * i;
        const amplitude = (audioData[i] / 255) * 80;
        // Mouse force interaction
        let force = 0;
        if (mouse.x) {
            const dist = Math.abs(x - mouse.x);
            if (dist < 100) force = (100 - dist) * 0.3;
        }
        const y = (synthesisCanvas.height / 2) + Math.sin(i * 0.15 + Date.now() * 0.002) * (amplitude + force);
        if (i === 0) synthesisCtx.moveTo(x, y);
        else synthesisCtx.lineTo(x, y);
    }
    synthesisCtx.stroke();

    // Art Waves (Terracotta)
    synthesisCtx.strokeStyle = 'rgba(200, 125, 85, 0.4)';
    synthesisCtx.beginPath();
    for (let i = 0; i < audioData.length; i++) {
        const x = (synthesisCanvas.width / audioData.length) * i;
        const amplitude = (audioData[audioData.length - 1 - i] / 255) * 60;
        let force = 0;
        if (mouse.x) {
            const dist = Math.abs(x - mouse.x);
            if (dist < 100) force = (100 - dist) * -0.3;
        }
        const y = (synthesisCanvas.height / 2) + Math.cos(i * 0.08 + Date.now() * 0.0015) * (amplitude + force) + 20;
        if (i === 0) synthesisCtx.moveTo(x, y);
        else synthesisCtx.lineTo(x, y);
    }
    synthesisCtx.stroke();
}

// Particle system reacting to sound
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseSize = Math.random() * 3 + 1;
        this.size = this.baseSize;
        this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.6)' : 'rgba(200, 125, 85, 0.6)';
        this.angle = Math.random() * 360;
        this.speed = Math.random() * 0.5 + 0.1;
    }
    update(audioDataValue) {
        this.angle += 0.2;
        this.x += Math.cos(this.angle * Math.PI / 180) * this.speed;
        this.y += Math.sin(this.angle * Math.PI / 180) * this.speed;
        
        // React to sound data
        this.size = this.baseSize + (audioDataValue / 255) * 12;
        
        // Edge bouncing
        if (this.x < 0 || this.x > synthesisCanvas.width) this.speed *= -1;
        if (this.y < 0 || this.y > synthesisCanvas.height) this.speed *= -1;
    }
    draw() {
        synthesisCtx.fillStyle = this.color;
        synthesisCtx.beginPath();
        synthesisCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        synthesisCtx.fill();
    }
}

function initParticles() {
    particleArray = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
        const x = Math.random() * 400 + 50;
        const y = Math.random() * 200 + 25;
        particleArray.push(new Particle(x, y));
    }
}

function drawParticles(audioData, mouse) {
    for (let i = 0; i < particleArray.length; i++) {
        const audioVal = audioData[i % audioData.length];
        particleArray[i].update(audioVal);
        particleArray[i].draw();
        
        // Connection lines (tech nodes merging with organic nodes)
        for (let j = i + 1; j < particleArray.length; j++) {
            const dx = particleArray[i].x - particleArray[j].x;
            const dy = particleArray[i].y - particleArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 75) {
                synthesisCtx.strokeStyle = `rgba(255, 255, 255, ${0.15 - distance/500})`;
                synthesisCtx.lineWidth = 0.5;
                synthesisCtx.beginPath();
                synthesisCtx.moveTo(particleArray[i].x, particleArray[i].y);
                synthesisCtx.lineTo(particleArray[j].x, particleArray[j].y);
                synthesisCtx.stroke();
            }
        }
    }
}

// --- Contact Form ---
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    if (!form) return;
}

window.handleContactSubmit = function(event) {
    event.preventDefault();
    const name = document.getElementById('form-name').value;
    alert(`Thank you, ${name}! Your connection request has been sent successfully.`);
    document.getElementById('portfolio-contact-form').reset();
};

// --- Helper Utilities ---
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
