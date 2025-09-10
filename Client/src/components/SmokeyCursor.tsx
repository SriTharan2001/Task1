import React, { useEffect } from "react";

const SmokeyCursor: React.FC = () => {
  useEffect(() => {
    // Hide the default cursor
    document.body.style.cursor = "none";

    // Define 4 unique smoke colors
    const smokeColors = [
      "rgba(255, 99, 132, 0.6)", // pink/red
      "rgba(54, 162, 235, 0.6)", // blue
      "rgba(255, 206, 86, 0.6)", // yellow
      "rgba(75, 192, 192, 0.6)", // teal/green
    ];

    const move = (e: MouseEvent) => {
      const smoke = document.createElement("span");
      smoke.className = "smoke";

      // random color from array
      const color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
      smoke.style.background = `radial-gradient(circle, ${color}, transparent)`;

      smoke.style.left = e.pageX + "px";
      smoke.style.top = e.pageY + "px";

      document.body.appendChild(smoke);

      setTimeout(() => {
        smoke.remove();
      }, 2000); // remove after fade out
    };

    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = "auto"; // restore cursor when unmounted
    };
  }, []);

  return null;
};

export default SmokeyCursor;
