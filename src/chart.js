import { tooltip } from "./tooltip";
import {
    isOver,
    toDate,
    circle,
    line,
    boundaries,
    css,
    toCoords,
    computeYRatio,
    computeXRatio
} from "./utils";
import { sliderChart } from "./slider";
import { checkBoxes } from "./checkboxes";
import { bottomChart } from "./bottomChart";

const WIDTH = 600;
const HEIGHT = 200;
const PADDING = 40;
const DPI_WIDTH = WIDTH * 2;
const DPI_HEIGHT = HEIGHT * 2;
const VIEW_WIDTH = DPI_WIDTH;
const VIEW_HEIGHT = DPI_HEIGHT - (PADDING * 2);
const ROWS_COUNT = 5;
// const SPEED = 300;

export function chart(root, data){
    let raf;

    root.innerHTML = `<div data-el="tooltip" class="tg-chart-tooltip"></div>
    <canvas data-el="main"></canvas>
    <div class="tg-chart-slider" data-el="slider">
        <canvas></canvas>
        <div data-el="left" class="tg-chart-slider__left">
            <div
                class="tg-chart-slider__arrow--left"
                data-el="arrow"
                data-type="left"
            ></div>
        </div>
        <div
        data-el="window"
        data-type="window"
        class="tg-chart-slider__window"
        ></div>
        <div data-el="right" class="tg-chart-slider__right">
            <div
                class="tg-chart-slider__arrow--right"
                data-el="arrow"
                data-type="right"
            ></div>
        </div>
    </div>
    <div id="tg-chart-checkbox-container"></div>`;

    const canvas = root.querySelector("[data-el='main']");
    const tip = tooltip(root.querySelector("[data-el='tooltip']"), data);
    const slider = sliderChart(root.querySelector("[data-el='slider']"), DPI_WIDTH);
    const checkBox = checkBoxes(root.querySelector("#tg-chart-checkbox-container"), data);
    const ctx = canvas.getContext("2d");

    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT;

    css(canvas, {
        width: WIDTH + "px",
        height: HEIGHT + "px"
    });

    const proxy = new Proxy({},{
        set(...args){
            const result = Reflect.set(...args);
            raf = requestAnimationFrame(paint);
            return result;
        }
    });

    slider.subscribe((pos) => { proxy.pos=pos });

    checkBox.subscribe((filter) => {
        proxy.filter=filter;
        bottomChart(root.querySelector("[data-el='slider']"), DPI_WIDTH, data, filter);
    });

    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseleave", mouseleave);

    function mousemove({clientX, clientY, currentTarget}){
        const { left, top } = currentTarget.getBoundingClientRect();
        proxy.mouse = {
            x: (clientX - left) * 2,
            tooltip: {
                left: clientX - left,
                top: clientY - top 
            }
        }
    }

    function mouseleave(){
        proxy.mouse = null;
        tip.hide();
    }

    function clear(){
        ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT);
    }

    function paint(){
        clear();

        const length = data.columns[0].length;
        const leftIndex = Math.round(length * proxy.pos[0] / 100);
        const rightIndex = Math.round(length * proxy.pos[1] / 100);

        const columns = data.columns.filter((col)=>{
            return data.types[col[0]] !== "line" || proxy.filter[col[0]];
        }).map(col => {
            const res = col.slice(leftIndex, rightIndex);

            if(typeof res[0] !== "string"){
                res.unshift(col[0]);
            }
            return res;
        });

        const [yMin,yMax] = boundaries({ columns, types: data.types });

        const xRatio = computeXRatio(VIEW_WIDTH, columns[0].length);
        const yRatio = computeYRatio(VIEW_HEIGHT, yMax, yMin);

        const xData = columns.filter((col)=>data.types[col[0]] !== "line")[0];
        const yData = columns.filter((col)=>{
            return data.types[col[0]] === "line"
        });
    
        yAxis(yMin, yMax);
        xAxis(xData, yData, xRatio);
    
        yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin)).forEach((coords, idx) => {
            const color = data.colors[yData[idx][0]];
            line(ctx, coords, { color });

            for(const [x, y] of coords){
                if(isOver(proxy.mouse, x, coords.length, DPI_WIDTH)){
                    circle(ctx, [x, y], color);
                    break;
                }
            }
        });
    }

    function xAxis(xData, yData, xRatio){
        const colsCount = 6;
        const step = Math.round(xData.length / colsCount);

        ctx.beginPath();
        for(let i = 1; i < xData.length; i++){
            const x = i * xRatio;

            if((i-1)%step === 0){
                const text = toDate(xData[i]);
                ctx.fillText(text.toString(), x, DPI_HEIGHT - 10);
            }

            if(isOver(proxy.mouse, x, xData.length, DPI_WIDTH)){
                ctx.save();
                ctx.moveTo(x, PADDING);
                    ctx.lineTo(x, DPI_HEIGHT - PADDING);
                ctx.restore();
 
                tip.show(proxy.mouse.tooltip, {
                    title: toDate(xData[i]),
                    items: yData.map(col => {
                        return {
                            color: data.colors[col[0]],
                            name: data.names[col[0]],
                            value: col[i+1]
                        }
                    })
                });
            }
        }
        ctx.stroke();
        ctx.closePath();
    }
    
    function yAxis(yMax, yMin){
        const step = VIEW_HEIGHT / (ROWS_COUNT);
        const textStep = (yMax - yMin) / ROWS_COUNT;
    
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#bbb";
        ctx.font = "normal 20px Helvetica,sans-serif";
        ctx.fillStyle = "#96a2aa";
        for(let i = 1; i <= ROWS_COUNT; i++) {
            const y = step * i;
            const text = Math.round(yMin + textStep * i);
            ctx.fillText(text.toString(), 5, y  + PADDING - 10);
            ctx.moveTo(0, y + PADDING);
            ctx.lineTo(DPI_WIDTH, y + PADDING);
        }
        ctx.stroke();
        ctx.closePath();
    }

    return {
        init(){
            paint()
        },
        destroy(){
            cancelAnimationFrame(raf);
            canvas.removeEventListener("mousemove", mousemove);
            canvas.removeEventListener("mouseleave", mouseleave);
        }
    }
}