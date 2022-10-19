import css from './Canvas.module.css';

import { useRef, useState } from 'react';

export const Canvas = () => {
  const canvas = useRef();

  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [line, setLine] = useState({});
  const [lines, setLines] = useState([]);
  const [dotes, setDotes] = useState([]);
  const [click, setClick] = useState(1);
  const [arrDotesAll, setArrDotesAll] = useState([]);
  const [disableBtn, setDisableBtn] = useState(false);

  function drawLine(ctx, line, color = '#000000') {
    if (!canvas.current) return;

    if (
      line?.start?.x === null ||
      line?.start?.y === null ||
      line?.end?.x === null ||
      line?.end?.y === null
    )
      return;
    // draw the line
    ctx.beginPath();
    ctx.moveTo(line?.start?.x, line?.start?.y);
    ctx.lineTo(line?.end?.x, line?.end?.y);
    ctx.strokeStyle = color;
    ctx.closePath();
    ctx.stroke();
  }

  function draw(lines) {
    const ctx = canvas.current.getContext('2d');

    lines?.forEach(line => {
      drawLine(ctx, line);
    });
  }

  function drawPoint(context, x, y, label, color = '#ff0000', size = 5) {
    if (x === undefined || y === undefined) return;
    context.beginPath();
    context.fillStyle = color;
    context.strokeStyle = 'black';
    context.arc(x, y, size, 0 * Math.PI, 2 * Math.PI);
    context.fill();
    context.stroke();

    if (label) {
      context.fillStyle = color;
      context.strokeStyle = 'black';
    }
  }

  function drawPoints(dotes) {
    const ctx = canvas.current.getContext('2d');

    dotes.forEach(dot => {
      if (!dot ?? Object.keys(dot).length === 0) return;
      drawPoint(ctx, dot.x, dot.y, 'P');
    });
  }

  function calculateIntersection(p1, p2, p3, p4) {
    const x1 = p1?.x;
    const y1 = p1?.y;
    const x2 = p2?.x;
    const y2 = p2?.y;

    const x3 = p3?.x;
    const y3 = p3?.y;
    const x4 = p4?.x;
    const y4 = p4?.y;

    const bx = x2 - x1;
    const by = y2 - y1;
    const dx = x4 - x3;
    const dy = y4 - y3;

    const dotPerp = bx * dy - by * dx;

    if (dotPerp === 0) return null;

    const cx = x3 - x1;
    const cy = y3 - y1;

    const t = (cx * dy - cy * dx) / dotPerp;
    if (t < 0 || t > 1) return null;

    const u = (cx * by - cy * bx) / dotPerp;
    if (u < 0 || u > 1) return null;

    const point = { x: x1 + t * bx, y: y1 + t * by };

    return point;
  }

  function mouseDown(e) {
    const ctx = canvas.current.getContext('2d');
    setDisableBtn(false);
    if (e.nativeEvent.button === 0) {
      setClick(prevState => {
        return prevState + 1;
      });

      if (click === 1) {
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
        drawPoints(dotes);
      }
      if (click === 2) {
        setIsDrawing(false);
        setLines(prev => [...prev, line]);
        setDotes(prev => [...prev, ...arrDotesAll]);

        setClick(1);
      }
    } else if (e.nativeEvent.button === 2) {
      setStart({ x: null, y: null });

      setEnd({ x: null, y: null });

      setLine({
        start,
        end,
      });

      draw(lines);

      drawLine(ctx, line);
      drawPoints(dotes);

      return;
    }
  }

  function mouseMove(e) {
    if (!isDrawing) return;

    const ctx = canvas.current.getContext('2d');

    setEnd({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });

    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

    setLine({
      start,
      end,
    });

    draw(lines);
    drawPoints(dotes);
    drawLine(ctx, line);

    const arrDotes = [];

    lines.forEach(prevLine => {
      if (line?.start?.x === null || line?.end?.x === null) return;

      const point = calculateIntersection(
        prevLine?.start,
        prevLine?.end,
        line.start,
        line.end
      );

      if (point === null) return;
      arrDotes.push(point);

      drawPoint(ctx, point?.x, point?.y, 'P', 'red', 5);
    });
    setArrDotesAll([...arrDotes]);
  }

  function disableMouseRightClick(e) {
    e.preventDefault();
  }

  const onCollapse = e => {
    const ctx = canvas.current.getContext('2d');
    console.dir(e.currentTarget);
    if (e.currentTarget === e.target) {
      setDisableBtn(true);
    }

    let arrLines = [];
    let timer = 3000;
    function loops(lines) {
      setTimeout(() => {
        timer -= 60;

        if (timer === 0) {
          ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
          return;
        }

        lines.forEach(cLine => {
          const { start, end } = cLine;

          const arrDotes = [];
          lines.forEach(prevLine => {
            if (cLine === prevLine) return;
            const cPoint = calculateIntersection(
              prevLine?.start,
              prevLine?.end,
              cLine.start,
              cLine.end
            );

            if (cPoint === null) return;
            arrDotes.push(cPoint);
          });

          ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
          drawPoints(arrDotes);

          const centerLine = {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
          };

          function percent(x1, y1, x2, y2) {
            const currentLine = {
              start: {
                x: x1 + (centerLine.x - x1) * 0.1,
                y: y1 + (centerLine.y - y1) * 0.1,
              },
              end: {
                x: x2 + (centerLine.x - x2) * 0.1,
                y: y2 + (centerLine.y - y2) * 0.1,
              },
            };
            return currentLine;
          }

          const currentPercent = percent(start.x, start.y, end.x, end.y);
          cLine = currentPercent;
          arrLines.push(currentPercent);
        });

        draw(arrLines);

        loops(arrLines); // рекурсiя
        arrLines = [];
      }, 100);
    }
    loops(lines);

    setLines([]);
    setLine({});
    setDotes([]);
  };

  return (
    <div className={css.Wrapper}>
      <canvas
        id="canvas"
        ref={canvas}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onContextMenu={disableMouseRightClick}
        width="1200"
        height="800"
        className={css.Canvas}
      ></canvas>
      <button onClick={onCollapse} className={css.Btn} disabled={disableBtn}>
        Collapse lines
      </button>
    </div>
  );
};
