/**
   * Creates and setup an xr scene
   * @param   canvasID 
   *          the rendering canvas id
   * @param   authoringData
   *          additional data
   * @returns xr scene promise
   */
import { Engine } from "babylonjs";
import { AuthoringData } from "xrauthor-loader";
import { App } from "./app";

export function createXRScene(
  canvasID: string,
  authoringData: AuthoringData,
) {
    /**
     * Entry point for app
     */
  const canvas = <HTMLCanvasElement>document.getElementById(canvasID);
  const engine = new Engine(canvas, true);

  const app = new App(engine, canvas, authoringData);
  const scenePromise = app.createScene();

  scenePromise.then((scene) => {
    engine.runRenderLoop(() => {
      app.update();
      scene.render();
    });
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
}

