import React, { useEffect, useRef } from 'react';

const SkillNetworkCanvas = ({ skills = [], activeSkillId = null, onSelectSkill }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = Math.max(400, canvas.parentElement.clientHeight || 400);
    };
    resize();
    window.addEventListener('resize', resize);

    // Build nodes from skills
    const count = skills.length > 0 ? skills.length : 10;
    const nodes = (skills.length > 0 ? skills : Array.from({ length: 10 })).map((skill, index) => {
      const angle = (index / count) * Math.PI * 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const x = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 30;
      const y = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 30;
      const score = skill?.score || 0;
      const name = skill?.name || `Skill ${index + 1}`;
      const id = skill?.id || `skill-${index}`;

      return {
        id, name, score, x, y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 18 + (score / 100) * 12,
        // Red Noir Palette
        color: score >= 85 ? '#EF233C' : score >= 60 ? '#FFFFFF' : score >= 40 ? '#FF3048' : '#71717A',
      };
    });

    // Center root node
    const rootNode = {
      id: 'core', name: 'AI CORE', score: 100,
      x: canvas.width / 2, y: canvas.height / 2,
      vx: 0, vy: 0, radius: 26, color: '#EF233C',
    };

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulse += 0.02;

      // Draw background dynamic grid/particles (Red Noir)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Connect nodes to center and to neighbors
      nodes.forEach((node) => {
        // Connect to core
        ctx.beginPath();
        ctx.moveTo(rootNode.x, rootNode.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = node.id === activeSkillId ? 'rgba(239, 35, 60, 0.6)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = node.id === activeSkillId ? 2.5 : 1;
        ctx.stroke();

        // Node animation drift
        node.x += node.vx;
        node.y += node.vy;

        // Soft wall bounce
        if (node.x < 40 || node.x > canvas.width - 40) node.vx *= -1;
        if (node.y < 40 || node.y > canvas.height - 40) node.vy *= -1;
      });

      // Inter-node connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(239, 35, 60, ${(1 - dist / 180) * 0.15})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw core node
      const coreGlow = 25 + Math.sin(pulse * 1.5) * 8;
      const coreGrad = ctx.createRadialGradient(rootNode.x, rootNode.y, 5, rootNode.x, rootNode.y, coreGlow + 20);
      coreGrad.addColorStop(0, 'rgba(239, 35, 60, 0.4)');
      coreGrad.addColorStop(1, 'rgba(239, 35, 60, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(rootNode.x, rootNode.y, coreGlow + 20, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#EF233C';
      ctx.beginPath(); ctx.arc(rootNode.x, rootNode.y, rootNode.radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Geist", "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SkillForge', rootNode.x, rootNode.y - 4);
      ctx.font = '700 9px "Geist", "Inter", sans-serif';
      ctx.fillText('ENGINE', rootNode.x, rootNode.y + 8);

      // Draw skill nodes
      nodes.forEach((node) => {
        const isActive = node.id === activeSkillId;
        const currentRadius = node.radius + (isActive ? Math.sin(pulse * 3) * 3 : 0);

        // Glow ring
        const grad = ctx.createRadialGradient(node.x, node.y, 4, node.x, node.y, currentRadius + 16);
        grad.addColorStop(0, `${node.color}40`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(node.x, node.y, currentRadius + 16, 0, Math.PI * 2); ctx.fill();

        // Outer circle
        ctx.fillStyle = '#050505'; // Dark bg
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isActive ? 3 : 1.5;
        ctx.beginPath(); ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 11px "Geist", "Inter", sans-serif';
        ctx.fillText(node.name.length > 14 ? node.name.substring(0, 12) + '..' : node.name, node.x, node.y - 2);

        ctx.fillStyle = node.color;
        ctx.font = 'bold 10px "Geist", "Inter", sans-serif';
        ctx.fillText(`${node.score}%`, node.x, node.y + 11);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Canvas Click Interaction
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      nodes.forEach((node) => {
        const dx = clickX - node.x;
        const dy = clickY - node.y;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 10) {
          if (onSelectSkill) onSelectSkill(node.id);
        }
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [skills, activeSkillId, onSelectSkill]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 400, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--sf-border-light)', background: 'var(--sf-bg-secondary)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 400, cursor: 'pointer' }} />
      <div style={{ position: 'absolute', bottom: 12, right: 16, pointerEvents: 'none', fontSize: '0.75rem', color: 'var(--sf-text-muted)', background: 'rgba(0,0,0,0.8)', padding: '6px 12px', borderRadius: 999, border: '1px solid var(--sf-border-light)', backdropFilter: 'blur(10px)' }}>
        ⚡ AI Neural Network • Interactive
      </div>
    </div>
  );
};

export default SkillNetworkCanvas;
