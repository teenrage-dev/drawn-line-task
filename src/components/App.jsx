import css from './App.module.css';
import { Canvas } from './Canvas/Canvas';
import { CanvasClasse } from './Canvas/CanvasClases';

export const App = () => {
  return (
    <div className={css.App}>
      {/* <Canvas /> */}
      <CanvasClasse />
    </div>
  );
};
