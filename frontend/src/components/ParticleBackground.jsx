import { useRef, useEffect } from "react";

export default function ParticleBackground({
  color = "255,255,255",
  particleCount = 20,//starting particle count
  maxDistance = 120,
  limit = 80,//max particles
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const mouse = useRef({ x: null, y: null, active: false, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function setSize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(0, rect.width) * dpr;
      canvas.height = Math.max(0, rect.height) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      const rect = canvas.getBoundingClientRect();
      const cw = Math.max(1, rect.width);
      const ch = Math.max(1, rect.height);

      const scaled = Math.round(
        Math.max(30, particleCount * Math.max(0.5, cw / 1200))//scaled for mobiles by decraesing the quantity
      );

      const arr = [];
      for (let i = 0; i < scaled; i++) {
        arr.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: 1 + Math.random() * 2,
        });
      }
      particlesRef.current = arr;
    }

    // animation loop
    function animate() {
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;

      ctx.clearRect(0, 0, cw, ch);

      const pts = particlesRef.current;

      // update & draw particles
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;

        // bounce on edges (respecting size)
        if (p.x <= 0 || p.x >= cw) p.vx *= -1;
        if (p.y <= 0 || p.y >= ch) p.vy *= -1;

        for (let j = i + 1; j < pts.length; j++) {
            const p1 = pts[j];
            const dx = p.x - p1.x;
            const dy = p.y - p1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = 2 * ( p.size + p1.size );//size is too small so we add a bigger hitbox

            if (dist < minDist) {
              // swap velocity
              const tempVx = p.vx;
              const tempVy = p.vy;
              p.vx = p1.vx;
              p.vy = p1.vy;
              p1.vx = tempVx;
              p1.vy = tempVy;

              // push particles apart slightly to avoid overlap
              const overlap = (minDist - dist) / 2;
              const nx = dx / dist;//nx and ny to make sure they move and not slide across 
              const ny = dy / dist;
              p.x += nx * overlap;
              p.y += ny * overlap;
              p1.x -= nx * overlap;
              p1.y -= ny * overlap;
            
            }
          }

        for (let j = i - 1; j >= 0; j--) {
          const p1 = pts[j];
          const dx = p.x - p1.x;
          const dy = p.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = 2 * ( p.size + p1.size ) ;

          if (dist < minDist) {
      
            const tempVx = p.vx;
            const tempVy = p.vy;
            p.vx = p1.vx;
            p.vy = p1.vy;
            p1.vx = tempVx;
            p1.vy = tempVy;

            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            p.x += nx * overlap;
            p.y += ny * overlap;
            p1.x -= nx * overlap;
            p1.y -= ny * overlap;
          }
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${color},1)`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

    
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {

          const a = pts[i],     b = pts[j];
          const dx = a.x - b.x,   dy = a.y - b.y;

          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35; // tweak strength
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color},${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // mouse grab lines
      if (mouse.current.active && mouse.current.x != null) {
        for (let p of pts) {
          const dx = p.x - mouse.current.x,
            dy = p.y - mouse.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.current.radius) {
            const alpha = (1 - dist / mouse.current.radius) * 0.8;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color},${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.current.x, mouse.current.y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    // input handlers
    function handlePointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    }
    function handlePointerOut() {
      mouse.current.active = false;
      mouse.current.x = null;
      mouse.current.y = null;
    }
    function handleClick(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const arr = particlesRef.current;
      for (let i = 0; i < 2; i++) {
        arr.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 1 + Math.random() * 2,
        });
      }
      // keep upper limit
      if (arr.length > limit) arr.splice(0, arr.length - limit);
    }

    // init
    setSize();
    window.addEventListener("resize", setSize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("click", handleClick);

    animate();

    // cleanup
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("click", handleClick);
    };
  }, [color, particleCount, maxDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
