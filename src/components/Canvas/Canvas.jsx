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
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.closePath();
    ctx.stroke();
  }

  function draw(lines) {
    const ctx = canvas.current.getContext('2d');

    lines?.forEach(line => {
      drawLine(ctx, line);
    });
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
  }

  function mouseMove(e) {
    if (!isDrawing) return;
    setEnd({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });

    const ctx = canvas.current.getContext('2d');

    setLine({
      start,
      end,
    });

    drawLine(ctx, line);
    // ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
  }

  function mouseUp(e) {
    setIsDrawing(false);

    setLines(prev => [...prev, line]);

    console.log('########MOUSEUP######');
    console.log(lines);
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
