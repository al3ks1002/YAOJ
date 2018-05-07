import ReactDOM from "react-dom";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap-theme.css";

import registerServiceWorker from "./utils/registerServiceWorker";

import { makeMainRoutes } from "./utils/routes";

const routes = makeMainRoutes();

ReactDOM.render(routes, document.getElementById("root"));

registerServiceWorker();
