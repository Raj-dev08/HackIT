import { useRef, useEffect } from "react";

export default function ExploreBackground({
  color = "255,255,255",
  particleCount = 25,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function setSize() {
      const cw = window.innerWidth;
      const ch = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      ); // 👈 ensures it covers total page height

      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(cw, ch);
    }

    function initParticles(cw, ch) {
      const scaled = Math.round(
        Math.max(15, particleCount * Math.max(0.5, cw / 1000))
      );

      const arr = [];
      for (let i = 0; i < scaled; i++) {
        const size = 6 + Math.random() * 14;
        arr.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          vx: (Math.random() - 0.5) * 1.2 ,
          vy: (Math.random() - 0.5) * 1.2 ,
          size,
        });
      }
      particlesRef.current = arr;
    }

    function animate() {
      const cw = window.innerWidth;
      const ch = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );

      ctx.clearRect(0, 0, cw, ch);
      const pts = particlesRef.current;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x - p.size/2 <= 0 || p.x + p.size/2 >= cw) p.vx *= -1;
        if (p.y - p.size/2 <= 0 || p.y + p.size/2 >= ch) p.vy *= -1;

        for (let j = i + 1; j < pts.length; j++) {
          const p1 = pts[j];
          //calculate the distance gaps
          const dx = p1.x - p.x;
          const dy = p1.y - p.y;
          //calculate the threshold
          const distX = (p.size + p1.size - p.size / 20 ) / 2;//a soft padding to make sure they dont look overlapped
          const distY = (p.size + p1.size - p.size / 20 ) / 2;

          if (Math.abs(dx) < distX && Math.abs(dy) < distY) {
            // Calculate overlap amounts
            const overlapX = distX - Math.abs(dx);
            const overlapY = distY - Math.abs(dy);

            // Move particles apart
            if (overlapX < overlapY) {
              const shift = overlapX / 2;
              if (dx > 0) {
                p.x -= shift;
                p1.x += shift;
              } else {
                p.x += shift;
                p1.x -= shift;
              }
            } else {
              const shift = overlapY / 2;
              if (dy > 0) {
                p.y -= shift;
                p1.y += shift;
              } else {
                p.y += shift;
                p1.y -= shift;
              }
            }

            const vxTemp = p.vx;
            const vyTemp = p.vy;
            p.vx = p1.vx * ( Math.random() + 0.4 ); //a bit randomness to look unpredictable
            p.vy = p1.vy *  ( Math.random() + 0.4 );
            p1.vx = vxTemp *  ( Math.random() + 0.4 );
            p1.vy = vyTemp *  ( Math.random() + 0.4 );
          }
        }

        ctx.fillStyle = `rgba(${color},0.1)`;
        ctx.fillRect( p.x - p.size , p.y - p.size , p.size , p.size );//setting the x and y at x-size so it stays centered
       
      }

      animRef.current = requestAnimationFrame(animate);
    }

     function hadnleMouseClick(e) {
      const arr = particlesRef.current;
      const size = 6 + Math.random() * 14;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let vx =  Math.random()  *  0.6 + 0.3;
      let vy =  Math.random()  *  0.6 + 0.3;
      for (let i = 1; i <= 2; i++) {
        if( i % 2 == 0 ){
          vx*=-1
          vy*=-1
        }
        arr.push({
          x: x + (Math.random() - 0.5) * size + size + (Math.random() - 0.5) * 50,
          y: y + (Math.random() - 0.5) * size + size + (Math.random() - 0.5) * 50 ,
          vx: vx ,
          vy: vy ,
          size,
        });
      }
      // keep upper limit
      if (arr.length > 80) arr.splice(0, arr.length - 80);
    }

    setSize();
    animate();
    window.addEventListener("resize", setSize);
    window.addEventListener("click",hadnleMouseClick)

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", setSize);
      window.removeEventListener("click",hadnleMouseClick)
    };
  }, [color, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full z-0 pointer-events-none"
      style={{
        height: "100%",
        position: "fixed",
        display: "block",
      }}
    />
  );
}
