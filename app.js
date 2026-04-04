document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Welcome Overlay ---
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const enterBtn = document.getElementById('enter-btn');
    if (welcomeOverlay && enterBtn) {
        enterBtn.addEventListener('click', () => {
            welcomeOverlay.classList.add('dissolve');
            setTimeout(() => {
                welcomeOverlay.classList.add('hidden');
            }, 1000); // Matches CSS transition duration
        });
    }

    // --- 1. Populate Home Grid ---
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid && typeof blogPosts !== 'undefined') {
        blogGrid.innerHTML = '';
        blogPosts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'card reveal-up';
            article.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${post.image}" alt="${post.title}" class="card-image" loading="lazy">
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="card-date">${post.date}</span>
                    </div>
                    <h4>${post.title}</h4>
                    <p>${post.excerpt}</p>
                    <a href="#post/${post.id}" class="read-more">อ่านเพิ่มเติม &rarr;</a>
                </div>
            `;
            blogGrid.appendChild(article);
        });
    }

    // --- 2. Advanced Interactions (Cursor, Hover, Tilt) ---
    
    // Custom Cursor
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    if (cursor && cursorFollower) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });
        
        const animateCursor = () => {
            followerX += (mouseX - followerX) * 0.2;
            followerY += (mouseY - followerY) * 0.2;
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        setTimeout(() => {
            const hoverElements = document.querySelectorAll('a, button, .card');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
            });
        }, 100);
    }

    // Interactive Observers
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // Magnetic Buttons Hover Effect
    const magneticButtons = document.querySelectorAll('.btn-dark, .btn-light, .btn-dark-sm');
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px) scale(1)`;
        });
    });

    // 3D Tilt for Cards (Dynamic Elements)
    setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8; // Pitch
                const rotateY = ((x - centerX) / centerX) * 8;  // Yaw
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }, 100);

    // --- 3. UI Toggles (Theme, Modals) ---
    
    // Theme Toggler
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });
    }

    // Modal Generic Handler
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closers = modal.querySelectorAll('.modal-close-trigger');
        closers.forEach(closer => {
            closer.addEventListener('click', (e) => {
                if (closer.tagName !== 'BUTTON' || closer.classList.contains('close-btn')) e.preventDefault();
                modal.classList.add('hidden'); // Force hide instead of toggle to prevent double-firing
            });
        });
    });

    const bindOpenBtn = (btnId, modalId) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (btn && modal) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.remove('hidden'); // Force open
            });
        }
    };

    bindOpenBtn('btn-contact-open', 'contact-modal');
    bindOpenBtn('btn-contact-about', 'contact-modal');
    bindOpenBtn('btn-donate-open', 'donate-modal');
    bindOpenBtn('btn-donate-about', 'donate-modal');

    // Contact form production logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-msg').value;

            btn.innerHTML = `Sending to Cloud...`;
            btn.style.opacity = '0.7';

            // Push to Production Architecture
            if (typeof window.saveContactMessageToDB === 'function') {
                await window.saveContactMessageToDB(email, message);
            }

            btn.innerHTML = `Stored Successfully ✓`;
            btn.style.opacity = '1';
            btn.style.background = '#10b981';
            
            setTimeout(() => {
                btn.innerHTML = `Send Message System`;
                btn.style.background = '';
                contactForm.reset();
                document.getElementById('contact-modal').classList.add('hidden');
            }, 2000);
        });
    }

    // Donate copy mechanic
    const btnCopyAcc = document.getElementById('btn-copy-acc');
    if (btnCopyAcc) {
        btnCopyAcc.addEventListener('click', () => {
            const accNum = document.getElementById('bank-acc-no').innerText;
            navigator.clipboard.writeText(accNum.replace(/-/g, ''));
            const successMsg = document.querySelector('.donate-success');
            
            btnCopyAcc.innerText = 'Copied! ✓';
            btnCopyAcc.style.background = '#10b981';
            successMsg.classList.remove('hidden');
            successMsg.style.opacity = '1';
            
            setTimeout(() => {
                btnCopyAcc.innerText = 'Copy Account Number';
                btnCopyAcc.style.background = '';
                successMsg.style.opacity = '0';
                setTimeout(() => successMsg.classList.add('hidden'), 300);
            }, 2500);
        });
    }

    // --- 4. SPA Routing & Navigation ---
    const homeView = document.getElementById('home-view');
    const articleView = document.getElementById('article-view');
    const aboutView = document.getElementById('about-view');
    
    // Markdown Parser
    const parseMarkdown = (md) => {
        let html = md.replace(/^### (.*$)/gim, '<h3>$1</h3>')
                     .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                     .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                     .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                     .replace(/\*(.*)\*/gim, '<em>$1</em>')
                     .replace(/\n\n/gim, "</p><p>");
                     
        html = html.replace(/```([\s\S]*?)```/gm, (match, code) => {
            return `<pre><button class="copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText); this.innerText='Copied ✓'; this.classList.add('copied'); setTimeout(()=> { this.innerText='Copy'; this.classList.remove('copied'); },2000)">Copy</button><code>${code.trim()}</code></pre>`;
        });
        
        return `<p>${html}</p>`;
    };

    const handleRoute = async () => {
        const hash = window.location.hash;
        
        // Reset Views
        homeView.classList.add('hidden');
        articleView.classList.add('hidden');
        if (aboutView) aboutView.classList.add('hidden');

        if (hash.startsWith('#post/')) {
            const postId = hash.replace('#post/', '');
            const post = typeof blogPosts !== 'undefined' ? blogPosts.find(p => p.id === postId) : null;
            articleView.classList.remove('hidden');
            window.scrollTo(0,0);
            
            if (post) {
                document.getElementById('article-title').innerText = post.title;
                document.getElementById('article-date').innerText = post.date;
                document.getElementById('article-image').src = post.image;
                
                const mockupMarkdown = `
## The Next Generation CMS is Here
Welcome to the SPA architecture of your blog. We pulled the metadata successfully:
**ID:** ${post.id}
**Excerpt:** ${post.excerpt}

### Seamless Syntax Highlighting 
By wrapping your code blocks in markdown, you can present clean, highly readable snippets just like Stripe or Vercel. Try the copy button!

\`\`\`javascript
class Antigravity {
    accelerate() {
        console.log("Houston, we have liftoff! 🚀");
        return { warpSpeed: true, awwwards: true };
    }
}
const spaceX = new Antigravity();
spaceX.accelerate();
\`\`\`

We also implemented **Dark Mode**, **Custom Cursors**, and **3D Glassmorphism Cards**. Enjoy the minimalist reading experience!
                `;
                document.getElementById('article-body').innerHTML = parseMarkdown(mockupMarkdown);
            }
        } 
        else if (hash === '#about') {
            if (aboutView) aboutView.classList.remove('hidden');
            window.scrollTo(0,0);
        }
        else {
            homeView.classList.remove('hidden');
            
            // Handle smooth scrolling for home anchors
            if (hash === '#articles' || hash === '#tutorials') {
                setTimeout(() => {
                    const target = document.getElementById(hash.replace('#', ''));
                    if (target) {
                        const offset = 80;
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = target.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        window.scrollTo({
                            top: elementPosition - offset,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            } else if (hash === '' || hash === '#') {
                window.scrollTo(0,0);
            }
        }
    };

    window.addEventListener('hashchange', handleRoute);
    
    // Back button wiring
    const backBtns = document.querySelectorAll('.back-btn-home');
    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = ''; // Return home correctly handles URL
        });
    });

    // Check initial route on load
    handleRoute();

    // --- 5. Reading Progress Bar ---
    const progress = document.getElementById('reading-progress');
    window.addEventListener('scroll', () => {
        if (!articleView.classList.contains('hidden') && progress) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progress.style.width = scrolled + "%";
        }
    });

});
