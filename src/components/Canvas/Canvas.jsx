import css from './Canvas.module.css';

import { useRef, useState } from 'react';

export const Canvas = () => {
  const canvas = useRef();

  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [line, setLine] = useState({});
  const [lines, setLines] = useState([]);
  const [dot, setDot] = useState({});
  const [dotes, setDotes] = useState([]);
  const [click, setClick] = useState(1);
  const [arrDotesAll, setArrDotesAll] = useState([]);

  function drawLine(ctx, line) {
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
    context.arc(x, y, size, 0 * Math.PI, 2 * Math.PI);
    context.fill();

    setDot({ x, y });

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
    // console.log('!!!!First line', p1, p2);
    // console.log('####Second line', p3, p4);

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
    // console.log(t);

    const u = (cx * by - cy * bx) / dotPerp;
    // console.log(u);
    if (u < 0 || u > 1) return null;

    const point = { x: x1 + t * bx, y: y1 + t * by };
    console.log(point);

    return point;
  }

  function mouseDown(e) {
    console.dir(e.nativeEvent);
    const ctx = canvas.current.getContext('2d');

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

        // console.log(dotes);

        draw(lines);
        drawPoints(dotes);
      }
      if (click === 2) {
        console.log('#####Second', arrDotesAll);
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

      setDot({});
      draw(lines);

      drawLine(ctx, line);
      drawPoints(dotes);

      return;
    }
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
    console.log(arrDotesAll);
  }

  function disableMouseRightClick(e) {
    e.preventDefault();
  }

  const onCollapse = e => {
    const ctx = canvas.current.getContext('2d');
    // ctx.translate(0, 0);
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    setLines([]);
    setLine({});
    setDotes([]);
    setDot({});

    console.dir(canvas.current);
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
      <button onClick={onCollapse} className={css.Btn}>
        Collapse lines
      </button>
    </div>
  );
};

// TODO ЯКщо ця точка знаходиться в межапх х і y попередньої лінії то це і є перетин попточної лінії і попередньої

// TODO ЦЯ точка є вже на лінії потрібно щоб при змінні руху лінії ця точка перезаписувалась в пвений обєкт, але при перетині іншої лінії скидалось значення
