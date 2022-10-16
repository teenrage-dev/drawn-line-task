import css from './Canvas.module.css';

import { useEffect, useRef, useState } from 'react';

export const Canvas = () => {
  const canvas = useRef();

  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [line, setLine] = useState({});
  const [lines, setLines] = useState([]);

  useEffect(() => {
    function draw(lines) {
      const ctx = canvas.current.getContext('2d');

      lines?.forEach(line => {
        drawLine(ctx, line);
      });
    }
    draw(lines);
  }, [lines]);

  // useEffect(() => {
  //   if (!canvas.current) return;

  //   const ctx = canvas.current.getContext('2d');
  //   // clear canvas
  //   // ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

  //   // draw the line
  //   ctx.beginPath();
  //   ctx.moveTo(start.x, start.y);
  //   ctx.lineTo(end.x, end.y);
  //   ctx.closePath();
  //   ctx.stroke();
  // }, [isDrawing, start, end]);

  function drawLine(ctx, line) {
    if (!canvas.current) return;

    // draw the line
    ctx.beginPath();
    ctx.moveTo(line?.start.x, line?.start.y);
    ctx.lineTo(line?.end.x, line?.end.y);
    ctx.closePath();
    ctx.stroke();
  }

  function drawPoint(context, x, y, label, color = '#000', size = 5) {
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, size, 0 * Math.PI, 2 * Math.PI);
    context.fill();

    console.log(x, y);

    if (label) {
      // let textX = x;
      // let textY = y - size - 3;

      // let text = label + '=(' + x + '; ' + y + ')';

      // context.font = 'Italic 14px Arial';
      context.fillStyle = color;
      // context.textAlign = 'center';
      // context.fillText(text, textX, textY);
    }
  }

  function calculateIntersection(p1, p2, p3, p4) {
    // down part of intersection point formula
    const d1 = (p1.x - p2.x) * (p3.y - p4.y); // (x1 - x2) * (y3 - y4)
    const d2 = (p1.y - p2.y) * (p3.x - p4.x); // (y1 - y2) * (x3 - x4)
    const d = d1 - d2;

    if (d === 0) {
      throw new Error('Number of intersection points is zero or infinity.');
    }

    // down part of intersection point formula
    const u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
    const u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

    const u2x = p3.x - p4.x; // (x3 - x4)
    const u3x = p1.x - p2.x; // (x1 - x2)
    const u2y = p3.y - p4.y; // (y3 - y4)
    const u3y = p1.y - p2.y; // (y1 - y2)

    // intersection point formula

    const px = (u1 * u2x - u3x * u4) / d;
    const py = (u1 * u2y - u3y * u4) / d;

    const p = { x: px, y: py };

    return p;
  }

  function mouseDown(e) {
    setIsDrawing(true);
    setStart({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
    setEnd({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });

    draw(lines);
  }

  function draw(lines) {
    const ctx = canvas.current.getContext('2d');

    lines?.forEach(line => {
      drawLine(ctx, line);
    });
  }

  function mouseMove(e) {
    if (!isDrawing) return;
    setEnd({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });

    const ctx = canvas.current.getContext('2d');
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

    setLine({
      start,
      end,
    });

    lines.forEach(prevLine => {
      console.log(prevLine);
      const point = calculateIntersection(
        prevLine.start,
        prevLine.end,
        line.start,
        line.end
      );

      console.log(point);
      drawPoint(ctx, point.x, point.y, 'P', 'red', 5);
    });
    drawLine(ctx, line);
  }

  function mouseUp(e) {
    setIsDrawing(false);

    setLines(prev => [...prev, line]);

    // console.log('########MOUSEUP######');
    // console.log(lines);
    // draw(lines);
    // console.log(line);
  }

  const onCollapse = e => {
    const ctx = canvas.current.getContext('2d');
    // ctx.translate(0, 0);
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    setLines([]);

    console.dir(canvas.current);
  };

  return (
    <div className={css.Wrapper}>
      <canvas
        id="canvas"
        ref={canvas}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        width="1200"
        height="800"
        className={css.Canvas}
      ></canvas>
      <button onClick={onCollapse} className={css.Btn}>
        Collapse Lines
      </button>
    </div>
  );
};
