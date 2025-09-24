import React from "react";
import { MainLayout, HomePage } from "./components";
import "./App.css";

function App() {
  return (
    <div className="App">
      <MainLayout>
        <HomePage />
      </MainLayout>
    </div>
  );
}
export default App
