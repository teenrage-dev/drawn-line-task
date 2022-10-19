import css from './App.module.css';
import { Canvas } from './Canvas/Canvas';
import { CanvasClasses } from './Canvas/CanvasClasses';

export const App = () => {
  return (
    <div className={css.App}>
      {/* <Canvas /> */}
      <CanvasClasses />
    </div>
  );
};
