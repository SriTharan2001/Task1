import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAutoLogout = (timeout = 1 * 60 * 1000) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Clear any auth token here if applicable
        localStorage.removeItem("token");
        alert("You have been logged out due to inactivity.");
        navigate("/login");
      }, timeout);
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // Start the initial timer

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(timer);
    };
  }, [navigate, timeout]);
};

export default useAutoLogout;
