import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { SchedulerProvider } from "./context/SchedulerContext";
import Scheduler from "./components/scheduler/Scheduler";
import "./styles/main.scss";

const App: React.FC = () => (
  <AuthProvider>
    <SchedulerProvider>
      <Scheduler />
    </SchedulerProvider>
  </AuthProvider>
);

export default App;