import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import TimelineIcon from "@mui/icons-material/Timeline";
import WarningIcon from "@mui/icons-material/Warning";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 220;

const menu = [
  { text: "Overview",  path: "/",          icon: DashboardIcon, color: "#7C6FE0" },
  { text: "Products",  path: "/products",   icon: LocalMallIcon, color: "#E07C8A" },
  { text: "Heatmap",   path: "/heatmap",    icon: WhatshotIcon,  color: "#E09C3A" },
  { text: "Funnel",    path: "/funnel",     icon: TimelineIcon,  color: "#3AB8E0" },
  { text: "Anomalies", path: "/anomalies",  icon: WarningIcon,   color: "#5AE07C" },
];

/* ── Animated blip for the live indicator ── */
function LiveBlip() {
  return (
    <Box sx={{ position: "relative", width: 8, height: 8 }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          bgcolor: "#5AE07C",
          animation: "ping 1.6s ease-in-out infinite",
          "@keyframes ping": {
            "0%":   { transform: "scale(1)",   opacity: 0.8 },
            "70%":  { transform: "scale(2.2)", opacity: 0   },
            "100%": { transform: "scale(2.2)", opacity: 0   },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          bgcolor: "#5AE07C",
        }}
      />
    </Box>
  );
}

/* ── Single nav item ── */
function NavItem({ item, index, isActive }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      component={Link}
      to={item.path}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        mb: 0.5,
        borderRadius: "10px",
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        animation: `slideIn 0.4s ease both`,
        animationDelay: `${index * 60}ms`,
        "@keyframes slideIn": {
          from: { opacity: 0, transform: "translateX(-16px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
        /* active bg */
        bgcolor: isActive
          ? `${item.color}18`
          : hovered
          ? "rgba(255,255,255,0.04)"
          : "transparent",
        /* active left bar */
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "20%",
          height: "60%",
          width: 3,
          borderRadius: "0 3px 3px 0",
          bgcolor: item.color,
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s",
          transform: isActive ? "scaleY(1)" : "scaleY(0)",
          opacity: isActive ? 1 : 0,
        },
        /* hover shimmer */
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, transparent 0%, ${item.color}0D 50%, transparent 100%)`,
          transform: hovered && !isActive ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.5s ease",
        },
      }}
    >
      {/* Icon pill */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          bgcolor: isActive ? `${item.color}22` : "transparent",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <Icon
          sx={{
            fontSize: 17,
            color: isActive ? item.color : hovered ? item.color : "rgba(255,255,255,0.35)",
            transition: "color 0.2s ease",
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: isActive ? 600 : 400,
          color: isActive
            ? "#fff"
            : hovered
            ? "rgba(255,255,255,0.8)"
            : "rgba(255,255,255,0.4)",
          transition: "all 0.2s ease",
          letterSpacing: isActive ? "-0.1px" : "0px",
          zIndex: 1,
        }}
      >
        {item.text}
      </Typography>

      {/* active dot */}
      {isActive && (
        <Box
          sx={{
            ml: "auto",
            width: 5,
            height: 5,
            borderRadius: "50%",
            bgcolor: item.color,
            boxShadow: `0 0 6px ${item.color}`,
            animation: "fadeDot 0.3s ease",
            "@keyframes fadeDot": {
              from: { opacity: 0, transform: "scale(0)" },
              to:   { opacity: 1, transform: "scale(1)" },
            },
          }}
        />
      )}
    </Box>
  );
}

/* ── Sidebar ── */
export default function Sidebar() {
  const location = useLocation();
  const canvasRef = useRef(null);

  /* subtle animated noise particles on canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = drawerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * drawerWidth,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.2,
      dy: -Math.random() * 0.3 - 0.1,
      a: Math.random() * 0.18 + 0.04,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160,140,255,${p.a})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * drawerWidth; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap');`}</style>

      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          height: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#0D0D12",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {/* particle canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.6,
          }}
        />

        {/* top gradient orb */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,111,224,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* ── LOGO ── */}
        <Box
          sx={{
            px: 2.5,
            pt: 2.8,
            pb: 2.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            zIndex: 1,
            animation: "fadeDown 0.5s ease both",
            "@keyframes fadeDown": {
              from: { opacity: 0, transform: "translateY(-10px)" },
              to:   { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            {/* logo image */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "0 0 16px rgba(124,111,224,0.4)",
                animation: "pulse 3s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%,100%": { boxShadow: "0 0 16px rgba(124,111,224,0.4)" },
                  "50%":     { boxShadow: "0 0 28px rgba(124,111,224,0.7)" },
                },
              }}
            >
              <img
                src="/image.png"
                alt="Purplle AI"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Syne', sans-serif",
                  color: "#fff",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.1,
                }}
              >
                Purplle AI
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  letterSpacing: "0.3px",
                }}
              >
                Store Intelligence
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── LIVE STATUS ── */}
        <Box
          sx={{
            mx: 2,
            mt: 2,
            mb: 1,
            px: 1.5,
            py: 1,
            borderRadius: "10px",
            bgcolor: "rgba(90,224,124,0.07)",
            border: "1px solid rgba(90,224,124,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "relative",
            zIndex: 1,
            animation: "fadeDown 0.5s 0.15s ease both",
          }}
        >
          <LiveBlip />
          <Typography
            sx={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "rgba(90,224,124,0.85)",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            LIVE · STORE_BLR_002
          </Typography>
        </Box>

        {/* ── NAV LABEL ── */}
        <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5, position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontSize: 9.5,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "rgba(255,255,255,0.2)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Navigation
          </Typography>
        </Box>

        {/* ── MENU ── */}
        <Box sx={{ px: 1.5, pt: 0.5, position: "relative", zIndex: 1 }}>
          {menu.map((item, i) => (
            <NavItem
              key={item.text}
              item={item}
              index={i}
              isActive={location.pathname === item.path}
            />
          ))}
        </Box>

        {/* ── DIVIDER ── */}
        <Box
          sx={{
            mx: 2.5,
            mt: 2,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
            position: "relative",
            zIndex: 1,
          }}
        />

        {/* ── QUICK STATS ── */}
        <Box sx={{ px: 2, pt: 2, position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontSize: 9.5,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "rgba(255,255,255,0.2)",
              fontFamily: "'DM Sans', sans-serif",
              mb: 1,
              px: 0.5,
            }}
          >
            Today
          </Typography>
          {[
            { label: "Visitors",   value: "—", color: "#7C6FE0" },
            { label: "Avg Dwell",  value: "—", color: "#3AB8E0" },
            { label: "Queue Avg",  value: "—", color: "#E09C3A" },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 1.5,
                py: 0.7,
                mb: 0.5,
                borderRadius: "8px",
                bgcolor: "rgba(255,255,255,0.03)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)", transition: "background 0.2s" },
              }}
            >
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
                {stat.label}
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: stat.color, fontFamily: "monospace" }}>
                {stat.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ── FOOTER ── */}
        <Box
          sx={{
            mt: "auto",
            px: 2.5,
            py: 2,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontFamily: "monospace" }}
          >
            v1.0 · AI Powered
          </Typography>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#7C6FE0",
              boxShadow: "0 0 8px #7C6FE0",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </Box>
      </Box>
    </>
  );
}