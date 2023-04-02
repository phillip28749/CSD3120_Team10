/*!*****************************************************************************
\file	app.ts
/*!*****************************************************************************
\brief
	This file contains the App class that include functions for creating an 
  XRScene and setting up the XR camera, controller interaction, and the 
  locomotion teleportation for the user.
*******************************************************************************/

import {
  Engine,
  Scene,
  Color3,
  MeshBuilder,
  StandardMaterial,
  FreeCamera,
} from "babylonjs";
import { XRScene } from "./Scene/XRScene";
import { Locomotion } from "./Input/index";
import { Collision } from "./Physics/Collision";
import "babylonjs-loaders";
import { GLOBAL } from "./Global";
import { AuthoringData } from "xrauthor-loader";

export class App {
  private engine: Engine;
  private canvas: HTMLCanvasElement;
  private authorData: AuthoringData;

  private xrScene: XRScene;
  private locomotion: Locomotion;

  constructor(
    engine: Engine,
    canvas: HTMLCanvasElement,
    authorData: AuthoringData
  ) {
    this.engine = engine;
    this.canvas = canvas;
    this.authorData = authorData;
    this.locomotion = null;
  }

  /**
   * Creates and setup an xr scene
   *
   * @returns xr scene promise
   */
  async createScene() {
    //create scene
    this.xrScene = new XRScene(this.engine, this.canvas, this.authorData);

    //create xr camera
    this.createXRCamera(this.xrScene.scene, this.xrScene.sceneCam.camera);

    //controller
    this.setupControllerInteraction();

    //editor inspector
    this.enableInspector(this.xrScene.scene);

    return this.xrScene.scene;
  }

  /**
   * Creates the editor inspector
   *
   * @param   scene
   *          the given scene
   *
   * @returns none
   */
  enableInspector(scene: Scene) {
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "i") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });
  }

  /**
   * Update logic of the vr app
   *
   * @returns none
   */
  update() {
    this.xrScene.xrPromise.then((xr) => {
      this.xrScene.OnUpdate();
    });
  }

  /**
   * Setup the xr controller interaction for rotation and translation
   *
   * @returns none
   */
  setupControllerInteraction() {
    this.xrScene.xrPromise.then((xr) => {
      Collision.OnPicking(xr, this.xrScene);
    });
  }

  /**
   * Creates the xr camera and its transformation based on the nonVRCamera transformation
   *
   * @param   scene
   *          the given scene
   *
   * @param   nonVRcamera
   *          the non vr scene camera for transitation to xr camera
   *
   * @returns none
   */
  async createXRCamera(scene: Scene, nonVRcamera: FreeCamera) {
    //ground
    var groundMat = new StandardMaterial("groundMat", scene);
    groundMat.emissiveColor = new Color3(0.5, 0.5, 0.5);
    const ground = MeshBuilder.CreateGround("ground", {
      width: 40,
      height: 30,
    });
    ground.position.y = -0.3;
    ground.material = groundMat;

    this.xrScene.xrPromise = scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-vr",
      },
      floorMeshes: [ground],
    });

    this.xrScene.xrPromise.then((xr) => {
      xr.baseExperience.camera.setTransformationFromNonVRCamera(nonVRcamera);
      const featureManager = xr.baseExperience.featuresManager;
      //locomotion
      this.locomotion = new Locomotion(xr, featureManager, ground);
      this.xrScene.SetLocomotion(this.locomotion);
    });

    //only for debugging
    //(window as any).xr = xr;
  }
}
