import { modeSwithcer } from "./modeSwitcher";
import { chart } from "./chart";
import data from "./data.json";
import "./styles.scss";

modeSwithcer(document.getElementById("mode_switcher"));
chart(document.getElementById("chart_1"), data[0]).init();
chart(document.getElementById("chart_2"), data[1]).init();
chart(document.getElementById("chart_3"), data[2]).init();
chart(document.getElementById("chart_4"), data[3]).init();
chart(document.getElementById("chart_5"), data[4]).init();