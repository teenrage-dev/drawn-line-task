import css from './App.module.css';
import { Canvas } from './Canvas/Canvas';

export const App = () => {
  return (
    <div className={css.App}>
      <Canvas />
    </div>
  );
};
