import { css, boundaries, toCoords, line, computeXRatio, computeYRatio } from "./utils";

export function bottomChart(root, DPI_WIDTH, data, filter){
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const HEIGHT = 40;
    const DPI_HEIGHT = HEIGHT * 2;
    const WIDTH = DPI_WIDTH / 2;

    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT;

    css(canvas, {
        width: WIDTH + "px",
        height: HEIGHT + "px"
    });

    const columns = data.columns.filter((col)=>{
        return data.types[col[0]] !== "line" || filter[col[0]];
    });

    const filteredData = {...data, columns: columns}

    const [yMin,yMax] = boundaries(filteredData);

    const xRatio = computeXRatio(DPI_WIDTH, columns[0].length);
    const yRatio = computeYRatio(DPI_HEIGHT, yMax, yMin);

    const yData = columns.filter((col)=>data.types[col[0]] === "line");

    yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, 0, yMin)).forEach((coords, idx) => {
       const color = data.colors[yData[idx][0]];
       line(ctx, coords, { color });
    });
}