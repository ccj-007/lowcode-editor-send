import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "amis/sdk/iconfont.css";
import "amis/lib/themes/cxd.css";
import "amis/lib/helper.css";
import { EditorStore } from  './store'

import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/css/v4-shims.css";

import "../node_modules/amis-editor-core/lib/style.css";

ReactDOM.render(<App store={new EditorStore()} />, document.getElementById("root"));

reportWebVitals();