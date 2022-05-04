let gridCache = null;

function traceDottedAxis(ctx, dim, lockedAxis, lineSpacing, dashLength) {
    let variableAxis, fixedAxis;

    switch (lockedAxis) {
        case "x":
            fixedAxis = dim.y;
            variableAxis = dim.x;
            break;
        case "y":
            fixedAxis = dim.x;
            variableAxis = dim.y;
            break;
    }

    for (let i = 0; i < fixedAxis; i++) {
        const a = i * lineSpacing;
        for (let j = 0; j < variableAxis * dashLength; j++) {
            const b = j * dashLength;

            if (j % 2 == 0) {
                ctx.fillStyle = "white";
            } else {
                ctx.fillStyle = "black";
            }

            switch (lockedAxis) {
                case "x":
                    ctx.fillRect(b, a, dashLength, 1);
                    break;
                case "y":
                    ctx.fillRect(a, b, 1, dashLength);
                    break;
            }
        }
    }
}

function traceDottedFrame(ctx, dim, lockedAxis, lineSpacing, dashLength) {
    let variableAxis, fixedAxis;

    switch (lockedAxis) {
        case "x":
            fixedAxis = dim.y;
            variableAxis = dim.x;
            break;
        case "y":
            fixedAxis = dim.x;
            variableAxis = dim.y;
            break;
    }
    for (let i = 0; i < 2; i++) {
        const a = i * fixedAxis * lineSpacing;
        for (let j = 0; j < variableAxis * dashLength; j++) {
            const b = j * dashLength;

            if (j % 2 == 0) {
                ctx.fillStyle = "yellow";
            } else {
                ctx.fillStyle = "black";
            }

            switch (lockedAxis) {
                case "x":
                    if (i % 2 == 0) {
                        ctx.fillRect(b, a, dashLength, 1);
                    } else {
                        ctx.fillRect(b, a - 1, dashLength, 1);
                    }
                    break;
                case "y":
                    if (i % 2 == 0) {
                        ctx.fillRect(a, b, 1, dashLength);
                    } else {
                        ctx.fillRect(a - 1, b, 1, dashLength);
                    }
                    break;
            }
        }
    }
}

function drawGrid(ctx) {
    if (gridCache) {
        ctx.drawImage(gridCache, 0, 0);
        return;
    }

    gridCache = document.createElement("canvas");
    const gridSize = new Dim2D(40, 30);
    const squareSize = 16;
    const dashesPerSquare = 4;
    const dashLength = squareSize / dashesPerSquare;

    gridCache.width = gridSize.x * squareSize;
    gridCache.height = gridSize.y * squareSize;
    const ctxC = gridCache.getContext("2d");

    // draw grid lines
    traceDottedAxis(ctxC, gridSize, "x", squareSize, dashLength);
    traceDottedAxis(ctxC, gridSize, "y", squareSize, dashLength);

    // draw gold frame
    traceDottedFrame(ctxC, gridSize, "x", squareSize, dashLength);
    traceDottedFrame(ctxC, gridSize, "y", squareSize, dashLength);

    ctx.drawImage(gridCache, 0, 0);
}
