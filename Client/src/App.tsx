import React from "react";
import AppRoutes from "./Routes/AppRoute";
import SmokeyCursor from "./components/SmokeyCursor";


const App: React.FC = () => {
  return (
    <div>
      <SmokeyCursor />
      
      <AppRoutes />
     
    </div>
  );
};

export default App;
