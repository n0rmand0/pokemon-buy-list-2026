import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {
  return (
    <>
      <header id="center">
        <h1>Pokemon Buy List</h1>
        <h2>Summer 2026</h2>
      </header>
      <section>
        <table className="styled-table">
          <thead>
            <tr>
              <th scope="col">Card</th>
              <th scope="col">Info</th>
              <th scope="col">Value Month 1</th>
              <th scope="col">Value Month 6</th>
              <th scope="col">Current Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jane Doe</td>
              <td>Engineering</td>
              <td>Lead Developer</td>
            </tr>
            <tr>
              <td>John Smith</td>
              <td>Design</td>
              <td>UI/UX Specialist</td>
            </tr>
            <tr>
              <td>Alice Johnson</td>
              <td>Marketing</td>
              <td>Campaign Manager</td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}

export default App;
