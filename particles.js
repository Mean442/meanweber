/**
 * particles.js
 * Vanilla JS Canvas Particle System
 * Inspired by Google Antigravity background aesthetics.
 */

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    canvas.id = "bg-canvas";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let particlesArray = [];
    let width, height;

    // Google-style aesthetic colors
    const colors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#9333EA"];

    function initSize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Particles move very slowly for an elegant feel
            this.velocityX = (Math.random() - 0.5) * 0.4;
            this.velocityY = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 3 + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.type = Math.random() > 0.5 ? "circle" : "square";
            this.angle = Math.random() * 360;
            this.spin = (Math.random() - 0.5) * 2;
        }

        update() {
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.angle += this.spin;

            // Bounce off edges smoothly
            if (this.x < 0 || this.x > width) this.velocityX *= -1;
            if (this.y < 0 || this.y > height) this.velocityY *= -1;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.angle * Math.PI) / 180);
            ctx.globalAlpha = 0.6; // Slight transparency
            
            ctx.fillStyle = this.color;
            if (this.type === "circle") {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
            }
            
            ctx.restore();
        }
    }

    function initParticles() {
        particlesArray = [];
        const numParticles = Math.floor((width * height) / 12000); // Responsive amount
        for (let i = 0; i < numParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
        initSize();
        initParticles();
    });

    initSize();
    initParticles();
    animate();
});
