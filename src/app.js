import {modeSwithcer} from "./modeSwitcher";
import { chart } from "./chart";
import data from "./data.json";
import "./styles.scss";

chart(document.getElementById("chart1"), data[0]).init();
chart(document.getElementById("chart2"), data[1]).init();
chart(document.getElementById("chart3"), data[2]).init();
chart(document.getElementById("chart4"), data[3]).init();
chart(document.getElementById("chart5"), data[4]).init();
modeSwithcer(document.getElementById("mode_switcher"));