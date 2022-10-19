import css from './Canvas.module.css';
import React, { Component, createRef } from 'react';

// import { useRef, useState } from 'react';

export class CanvasClasse extends Component {
  canvas = createRef();

  state = {
    isDrawing: false,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    line: {},
    lines: [],
    dotes: [],
    click: 1,
    arrDotesAll: [],
    disableBtn: false,
  };

  drawLine(ctx, line, color = '#000000') {
    if (!this.canvas.current) return;

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

  draw(lines) {
    const ctx = this.canvas.current.getContext('2d');

    lines?.forEach(line => {
      this.drawLine(ctx, line);
    });
  }

  drawPoint(context, x, y, label, color = '#ff0000', size = 5) {
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

  drawPoints(dotes) {
    const ctx = this.canvas.current.getContext('2d');

    dotes.forEach(dot => {
      if (!dot ?? Object.keys(dot).length === 0) return;
      this.drawPoint(ctx, dot.x, dot.y, 'P');
    });
  }

  calculateIntersection(p1, p2, p3, p4) {
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

  mouseDown = e => {
    const ctx = this.canvas.current.getContext('2d');
    this.setState({
      disableBtn: false,
    });

    const { start, end, lines, line, arrDotesAll, click, dotes } = this.state;

    if (e.nativeEvent.button === 0) {
      this.setState(prevState => {
        return {
          click: prevState.click + 1,
        };
      });

      if (click === 1) {
        this.setState({
          isDrawing: true,
        });
        this.setState({
          start: {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          },
          end: {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          },
        });

        this.draw(lines);
        this.drawPoints(dotes);
      }
      if (click === 2) {
        this.setState({
          isDrawing: false,
        });
        this.setState(prevState => {
          return {
            lines: [...prevState.lines, line],
            dotes: [...prevState.dotes, ...arrDotesAll],
          };
        });
        this.setState({
          click: 1,
        });
      }
    } else if (e.nativeEvent.button === 2) {
      this.setState({
        start: {
          x: null,
          y: null,
        },
        end: {
          x: null,
          y: null,
        },
      });

      this.setState({
        line: {
          start,
          end,
        },
      });

      this.draw(lines);

      this.drawLine(ctx, line);
      this.drawPoints(dotes);

      return;
    }
  };

  mouseMove = e => {
    if (!this.state.isDrawing) return;

    const { start, end, line, lines, dotes } = this.state;
    const ctx = this.canvas.current.getContext('2d');

    this.setState({
      end: {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      },
    });

    ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);

    this.setState({
      line: {
        start,
        end,
      },
    });

    this.draw(lines);
    this.drawPoints(dotes);
    this.drawLine(ctx, line);

    const arrDotes = [];

    lines.forEach(prevLine => {
      if (line?.start?.x === null || line?.end?.x === null) return;

      const point = this.calculateIntersection(
        prevLine?.start,
        prevLine?.end,
        line.start,
        line.end
      );

      if (point === null) return;
      arrDotes.push(point);

      this.drawPoint(ctx, point?.x, point?.y, 'P', 'red', 5);
    });
    this.setState({
      arrDotesAll: [...arrDotes],
    });
  };

  disableMouseRightClick = e => {
    e.preventDefault();
  };

  onCollapse = e => {
    const ctx = this.canvas.current.getContext('2d');

    const { lines } = this.state;

    if (e.currentTarget === e.target) {
      this.setState({
        disableBtn: true,
      });
    }

    let arrLines = [];
    let timer = 3000;
    const loops = lines => {
      setTimeout(() => {
        timer -= 60;

        if (timer === 0) {
          ctx.clearRect(
            0,
            0,
            this.canvas.current.width,
            this.canvas.current.height
          );
          return;
        }

        lines.forEach(cLine => {
          const { start, end } = cLine;

          const arrDotes = [];
          lines.forEach(prevLine => {
            if (cLine === prevLine) return;
            const cPoint = this.calculateIntersection(
              prevLine?.start,
              prevLine?.end,
              start,
              end
            );

            if (cPoint === null) return;
            arrDotes.push(cPoint);
          });

          ctx.clearRect(
            0,
            0,
            this.canvas.current.width,
            this.canvas.current.height
          );
          this.drawPoints(arrDotes);

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

        this.draw(arrLines);

        loops(arrLines); // рекурсiя
        arrLines = [];
      }, 100);
    };
    loops(lines);

    this.setState({
      lines: [],
      line: {},
      dotes: [],
    });
  };

  render() {
    const { disableBtn } = this.state;

    return (
      <div className={css.Wrapper}>
        <canvas
          id="canvas"
          ref={this.canvas}
          onMouseDown={this.mouseDown}
          onMouseMove={this.mouseMove}
          onContextMenu={this.disableMouseRightClick}
          width="1200"
          height="800"
          className={css.Canvas}
        ></canvas>
        <button
          onClick={this.onCollapse}
          className={css.Btn}
          disabled={disableBtn}
        >
          Collapse lines
        </button>
      </div>
    );
  }
}
