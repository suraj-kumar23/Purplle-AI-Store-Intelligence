import { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, Typography, Avatar } from "@mui/material";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <Typography
      sx={{
        fontSize: 11,
        fontFamily: "monospace",
        color: "rgba(255,255,255,0.3)",
        letterSpacing: "0.5px",
      }}
    >
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </Typography>
  );
}

export default function Navbar() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap');`}</style>

      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#0D0D12",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          color: "text.primary",
          animation: "fadeDown 0.4s ease both",
          "@keyframes fadeDown": {
            from: { opacity: 0, transform: "translateY(-8px)" },
            to:   { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* subtle top accent line */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(124,111,224,0.6) 40%, rgba(176,111,224,0.6) 60%, transparent 100%)",
          }}
        />

        <Toolbar sx={{ minHeight: "52px !important", px: 3, gap: 2 }}>

          {/* ── Page Title ── */}
          <Typography
            sx={{
              flexGrow: 1,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Syne', sans-serif",
              color: "#fff",
              letterSpacing: "-0.2px",
            }}
          >
            Store Intelligence
          </Typography>

          {/* ── Clock ── */}
          <Clock />

          {/* ── Divider ── */}
          <Box sx={{ width: "1px", height: 20, bgcolor: "rgba(255,255,255,0.08)" }} />

          {/* ── AI Analytics badge ── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.4,
              py: 0.6,
              borderRadius: "8px",
              border: "1px solid rgba(124,111,224,0.25)",
              bgcolor: "rgba(124,111,224,0.08)",
              cursor: "default",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(124,111,224,0.15)",
                border: "1px solid rgba(124,111,224,0.4)",
              },
            }}
          >
            {/* animated dot */}
            <Box sx={{ position: "relative", width: 6, height: 6 }}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "#7C6FE0",
                  animation: "ping 1.8s ease-in-out infinite",
                  "@keyframes ping": {
                    "0%":   { transform: "scale(1)",   opacity: 0.7 },
                    "70%":  { transform: "scale(2.4)", opacity: 0   },
                    "100%": { transform: "scale(2.4)", opacity: 0   },
                  },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "#7C6FE0",
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "rgba(124,111,224,0.9)",
                fontWeight: 500,
                letterSpacing: "0.4px",
              }}
            >
              AI Analytics
            </Typography>
          </Box>

          {/* ── Divider ── */}
          <Box sx={{ width: "1px", height: 20, bgcolor: "rgba(255,255,255,0.08)" }} />

          {/* ── Avatar ── */}
          <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              background: "linear-gradient(135deg, #7C6FE0 0%, #B06FE0 100%)",
              color: "#fff",
              boxShadow: "0 0 12px rgba(124,111,224,0.35)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 0 20px rgba(124,111,224,0.6)",
                transform: "scale(1.08)",
              },
            }}
          >
            AI
          </Avatar>

        </Toolbar>
      </AppBar>
    </>
  );
}