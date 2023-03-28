
// import { Engine , Xbox360Button , EventState , StickValues , DualShockButton} from "babylonjs";
// import { App } from "./app";
// //import { Controller,Type } from "./controller";


  // /**
  //    * Creates and setup an xr scene
  //    * @param   canvasID 
  //    *          the rendering canvas id
  //    * @param   authoringData
  //    *          additional data
  //    * @returns xr scene promise
  //    */
// export function createXRScene(canvasID : string, authoringData : { [dataType: string] : { [key: string] : any }})
// {
//     /**
//      * Entry point for app
//      */
//     const canvas = document.getElementById(canvasID) as HTMLCanvasElement;
//     const engine = new Engine(canvas,true)
//     const app = new App(engine,canvas,authoringData);
//     const scenePromise = app.createScene()

//     //setting up controller & its event callbacks
//     // const controller  = new Controller();
//     // controller.xboxBtnEventCB = xboxBtnEventCB;
//     // controller.xboxTriggerEventCB = xboxTriggerEventCB;
//     // controller.xboxStickEventCB = xboxStickEventCB;
//     // controller.dsBtnEventCB = dsBtnEventCB;
//     // controller.dsStickEventCB = dsStickEventCB;
//     // controller.dsStickEventCB = dsStickEventCB;
//     // controller.Init();  
    
//     scenePromise.then( (scene) => { 

//         engine.runRenderLoop(()=>{
//             app.update();
//             scene.render();
//         });
//     });

//     window.addEventListener("Resize", function(){
//         engine.resize()
//     });

// }

import { Engine } from "babylonjs";
import { AuthoringData } from "xrauthor-loader";
import { App } from "./app";

export function createXRScene(
  canvasID: string,
  authoringData: AuthoringData,
) {
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

