import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import API_BASE_URL, { getMediaUrl } from '../config';

import { useNavigate } from 'react-router-dom';

function FloatingAvatars() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [avatars, setAvatars] = useState([]);
  const ballsRef = useRef([]);
  const animationRef = useRef(null);
  const API = 'http://localhost:5000' || 'https://triumvitavolo.onrender.org'; // Usa la costante API_BASE_URL

  useEffect(() => {
    // Carica gli avatar dal backend
    const loadAvatars = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/events/names`);
        const people = response.data.filter(person => person.avatar_url);
        setAvatars(people);
      } catch (error) {
        console.error('Errore caricamento avatar:', error);
      }
    };

    loadAvatars();
  }, []);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on any ball
    // Iterate in reverse to check top-most balls first
    for (let i = ballsRef.current.length - 1; i >= 0; i--) {
      const ball = ballsRef.current[i];
      const dx = x - (ball.x + ball.size / 2);
      const dy = y - (ball.y + ball.size / 2);

      // Check distance from center (radius = size / 2)
      if (dx * dx + dy * dy <= (ball.size / 2) * (ball.size / 2)) {
        // Clicked!
        if (ball.img && ball.img.person && ball.img.person.name) {
          navigate(`/profile/${ball.img.person.name}`);
        }
        return; // Only navigate to the top-most avatar
      }
    }
  };

  useEffect(() => {
    if (avatars.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Imposta dimensioni canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Carica immagini avatar
    const validImages = [];
    let imagesLoaded = 0;

    const checkAllLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === avatars.length) {
        if (validImages.length > 0) {
          initBalls(validImages);
        } else {
          console.warn('Nessun avatar valido caricato');
        }
      }
    };

    avatars.forEach((person) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      // Attach person data to image for easy access in click handler
      img.person = person;

      img.onload = () => {
        validImages.push({ img, person });
        checkAllLoaded();
      };

      img.onerror = () => {
        console.warn(`Impossibile caricare avatar: ${person.avatar_url}`);
        checkAllLoaded();
      };

      img.src = getMediaUrl(person.avatar_url);
    });

    // Inizializza palline
    const initBalls = (validImages) => {
      ballsRef.current = [];
      const numBalls = Math.min(validImages.length, 15); // Max 15 avatar

      for (let i = 0; i < numBalls; i++) {
        const size = 60 + Math.random() * 40; // Dimensione casuale 60-100px
        ballsRef.current.push({
          x: Math.random() * (canvas.width - size),
          y: Math.random() * (canvas.height - size),
          vx: (Math.random() - 0.5) * 3, // Velocità X
          vy: (Math.random() - 0.5) * 3, // Velocità Y
          size: size,
          img: validImages[i % validImages.length].img,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02
        });
      }

      animate();
    };


    // Animazione
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ballsRef.current.forEach(ball => {
        // ⭐ CONTROLLA CHE L'IMMAGINE SIA VALIDA
        if (!ball.img || !ball.img.complete || ball.img.naturalWidth === 0) {
          return; // Salta questa palla se l'immagine non è valida
        }

        // Aggiorna posizione
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Rimbalzo sui bordi
        if (ball.x <= 0 || ball.x + ball.size >= canvas.width) {
          ball.vx *= -1;
          ball.x = Math.max(0, Math.min(ball.x, canvas.width - ball.size));
        }
        if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
          ball.vy *= -1;
          ball.y = Math.max(0, Math.min(ball.y, canvas.height - ball.size));
        }

        // Aggiorna rotazione
        ball.rotation += ball.rotationSpeed;

        // Disegna avatar circolare
        try {
          ctx.save();
          ctx.translate(ball.x + ball.size / 2, ball.y + ball.size / 2);
          ctx.rotate(ball.rotation);

          // Clip circolare
          ctx.beginPath();
          ctx.arc(0, 0, ball.size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Disegna immagine
          ctx.drawImage(
            ball.img,
            -ball.size / 2,
            -ball.size / 2,
            ball.size,
            ball.size
          );

          ctx.restore();

          // Bordo bianco con ombra
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 10;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } catch (error) {
          console.error('Errore nel disegno:', error);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [avatars]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'auto'
      }}
    />
  );
}

export default FloatingAvatars;