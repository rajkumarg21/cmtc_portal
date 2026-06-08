// import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
// import { IconButton, Tooltip } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';

// const generateRandomText = (length = 5) => {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
// };

// const Captcha = forwardRef(({ onChange }, ref) => {
//   const canvasRef = useRef(null);
//   const [captchaText, setCaptchaText] = useState('');

//   // Generate & draw captcha
//   const drawCaptcha = (text) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const width = 150;
//     const height = 50;

//     canvas.width = width;
//     canvas.height = height;

//     // Background
//     ctx.fillStyle = '#f0f0f0';
//     ctx.fillRect(0, 0, width, height);

//     // Random lines (noise)
//     for (let i = 0; i < 5; i++) {
//       ctx.strokeStyle = `rgba(0,0,0,${Math.random()})`;
//       ctx.beginPath();
//       ctx.moveTo(Math.random() * width, Math.random() * height);
//       ctx.lineTo(Math.random() * width, Math.random() * height);
//       ctx.stroke();
//     }

//     // Text
//     ctx.font = 'bold 28px Arial';
//     for (let i = 0; i < text.length; i++) {
//       const x = 20 + i * 22;
//       const y = 35 + Math.random() * 5;
//       const angle = Math.random() * 0.3 - 0.15;
//       ctx.save();
//       ctx.translate(x, y);
//       ctx.rotate(angle);
//       ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 30%)`; // random colors
//       ctx.fillText(text[i], 0, 0);
//       ctx.restore();
//     }

//     // Extra dots for more noise
//     for (let i = 0; i < 30; i++) {
//       ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
//       ctx.beginPath();
//       ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, 2 * Math.PI);
//       ctx.fill();
//     }
//   };

//   const generateCaptcha = () => {
//     const newText = generateRandomText();
//     setCaptchaText(newText);
//     drawCaptcha(newText);
//     onChange(newText);
//   };

//   // Generate on mount
//   useEffect(() => {
//     generateCaptcha();
//   }, []);

//   // ✅ Allow parent to call refreshCaptcha()
//   useImperativeHandle(ref, () => ({
//     refreshCaptcha: generateCaptcha,
//   }));

//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//       <canvas
//         ref={canvasRef}
//         style={{
//           border: '1px solid #ccc',
//           borderRadius: 4,
//           cursor: 'default',
//           background: '#f9f9f9',
//         }}
//       />
//       <Tooltip title="Refresh Captcha">
//         <IconButton onClick={generateCaptcha} size="small">
//           <RefreshIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//     </div>
//   );
// });

// export default Captcha;
