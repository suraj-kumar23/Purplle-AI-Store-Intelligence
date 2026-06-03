import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import MainLayout from "../src/layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Heatmap from "./pages/Heatmap";
import Funnel from "./pages/Funnel";
import Anomalies from "./pages/Anomalies";

function App() {

  return (

    <BrowserRouter>

      <MainLayout>

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/heatmap"
            element={<Heatmap />}
          />

          <Route
            path="/funnel"
            element={<Funnel />}
          />

          <Route
            path="/anomalies"
            element={<Anomalies />}
          />

        </Routes>

      </MainLayout>

    </BrowserRouter>

  );
}

export default App;