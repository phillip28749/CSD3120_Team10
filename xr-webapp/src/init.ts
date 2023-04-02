/*!*****************************************************************************
\file	init.ts
/*!*****************************************************************************
\brief
	This file contains the entry point for the vr application.
*******************************************************************************/

import { Engine } from "babylonjs";
import { AuthoringData } from "xrauthor-loader";
import { App } from "./app";

/**
 * Creates and setup the entry point of the vr application
 *
 * @param   canvasID
 *          the rendering canvas id
 *
 * @param   authoringData
 *          xr author data
 *
 * @returns xr scene promise
 */
export function createEntryPoint(
  canvasID: string,
  authoringData: AuthoringData
) {
  /**
   * Entry point for vr app
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
