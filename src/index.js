import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ReduxRPG from "./View/ReduxRPG";
import rootReducer from "./Modules";
import { Provider } from "react-redux";
import { createStore } from "redux";

const store = createStore(rootReducer);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReduxRPG />
    </Provider>
  </React.StrictMode>
);
