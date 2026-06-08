import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, IconButton, Typography } from "@mui/material";

const generateCaptchaText = (length = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let text = "";
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
};

const Captcha = forwardRef(({ onChange }, ref) => {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState("");

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0,0,0,0.2)`;
      ctx.beginPath();
      ctx.moveTo(
        Math.random() * width,
        Math.random() * height
      );
      ctx.lineTo(
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Text
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#111827";
    ctx.textBaseline = "middle";

    const spacing = width / (text.length + 1);

    for (let i = 0; i < text.length; i++) {
      const x = spacing * (i + 1);
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() - 0.5) * 0.4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Dots noise
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };

  const refreshCaptcha = () => {
    const newText = generateCaptchaText(6);
    setCaptchaText(newText);
    onChange?.(newText);
    drawCaptcha(newText);
  };

  useImperativeHandle(ref, () => ({
    refreshCaptcha,
  }));

  useEffect(() => {
    refreshCaptcha();
  }, []);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{ mt: 1 }}
    >
      <canvas
        ref={canvasRef}
        width={160}
        height={50}
        style={{
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#fff",
        }}
      />

      <IconButton
        onClick={refreshCaptcha}
        size="small"
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 2,
        }}
      >
        <RefreshIcon />
      </IconButton>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        Click refresh if unclear
      </Typography>
    </Box>
  );
});

export default Captcha;