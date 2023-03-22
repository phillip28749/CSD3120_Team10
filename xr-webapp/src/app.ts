import {
  Engine,
  WebXRMotionControllerTeleportation,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
  Color3,
  MeshBuilder,
  HemisphericLight,
  StandardMaterial,
  CubeTexture,
  Texture,
  FreeCamera,
  WebXRFeaturesManager,
  WebXRDefaultExperience,
  Space,
  WebXRFeatureName,
  ExecuteCodeAction,
  ActionManager,
  AbstractMesh,
} from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
import { MoleculeManager, Molecule, MoleculeLabel } from "./Component/index";
import { XRScene } from "./Scene/XRScene";
import { Locomotion } from "./Input/index";
import "babylonjs-loaders";

export class App {
  private engine: Engine;
  private canvas: HTMLCanvasElement;
  private authorData: any;

  private xrPromise: Promise<WebXRDefaultExperience>; // xr experience obj
  private xrPointerMesh: AbstractMesh; // the mesh currently attached under xrcontroller pointer

  private xrScene: XRScene;
  private locomotion: Locomotion;

  constructor(engine: Engine, canvas: HTMLCanvasElement, authorData: any) {
    this.engine = engine;
    this.canvas = canvas;
    this.authorData = authorData;
    this.xrPointerMesh = null;
    this.locomotion = null;
  }

  /**
   * Creates and setup an xr scene
   * @returns xr scene promise
   */
  async createScene() {
    //create scene
    this.xrScene = new XRScene(this.engine, this.canvas);

    //create xr camera
    this.createXRCamera(this.xrScene.scene, this.xrScene.sceneCam.camera);

    //controller
    this.setupControllerInteraction();

    //editor inspector
    this.enableInspector(this.xrScene.scene);

    return this.xrScene.scene;
  }

  /**
   * Update logic of the xr webapp
   * @param   scene
   *          the current scene
   */
  update(scene: Scene) {
    this.xrPromise.then((xr) => {
      //reaction zone trigger update
      if (!this.xrPointerMesh) return;
      if (
        this.xrPointerMesh.intersectsMesh(
          this.xrScene.reactionZone,
          false,
          true
        )
      ) {
        // reaction trigger logic
        //console.log("Meshes intersecting!");
        this.xrScene.moleculeMg.addReactionToList(
          this.xrScene.moleculeMg.currSelected
        );
        this.xrScene.moleculeMg.currSelected = null;
        this.xrPointerMesh.dispose();
        this.xrPointerMesh = null;
      }
    });
  }

  enableInspector(scene: Scene) {
    window.addEventListener("keydown", (e) => {
      if (e.metaKey && e.shiftKey && e.key === "i") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });
  }

  /**
   * Setup the xr controller interaction for rotation and translation
   */
  setupControllerInteraction() {
    this.xrPromise.then((xr) => {
      //setup controller drag
      let mesh: AbstractMesh;
      let p: AbstractMesh;

      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
          const trigger = motionController.getComponentOfType("trigger");
          trigger.onButtonStateChangedObservable.add((state) => {
            if (trigger.changes.pressed) {
              if (this.xrPointerMesh != null)
                // make sure only one item is selected at a time
                return;

              if (
                (mesh = xr.pointerSelection.getMeshUnderPointer(
                  controller.uniqueId
                ))
              ) {
                //console.log("mesh under controller pointer: " + mesh.name);
                // only allow picking if its a molecule
                if (mesh.name.indexOf("Molecule") !== -1) {
                  const distance = Vector3.Distance(
                    motionController.rootMesh.getAbsolutePosition(),
                    mesh.getAbsolutePosition()
                  );
                  if (distance < 1) {
                    // make sure we can only pick reactants
                    let m = this.xrScene.moleculeMg.findReactants(mesh.uniqueId);
                    if (m) {
                      this.xrPointerMesh = this.xrScene.moleculeMg.clone(m); //clone the master mesh
                      this.xrPointerMesh.setParent(
                        motionController.rootMesh,
                        true
                      ); //set under parent controller's mesh
                      this.xrScene.moleculeMg.currSelected = m;
                    }
                  }
                }
              } else {
                if (mesh && mesh.parent) {
                  mesh.setParent(null);
                  this.xrPointerMesh.setParent(null);
                  //console.log("release mesh: " + mesh.name);
                }
              }
            }
          });
        });
      });
    });
  }

  /**
   * Initiatize teleportation based locomotion
   * @param   xr
   *          WebXRDefaultExperience object from defaultwebxrexperience
   * @param   featureManager
   *          WebXRFeaturesManager object from defaultwebxrexperience
   * @param   ground
   *          the scene ground mesh used for checking teleportation
   */
  initLocomotion(
    xr: WebXRDefaultExperience,
    featureManager: WebXRFeaturesManager,
    ground: AbstractMesh
  ) {
    const teleportation = featureManager.enableFeature(
      WebXRFeatureName.TELEPORTATION,
      "stable",
      {
        xrInput: xr.input,
        floorMeshes: [ground],
        timeToTeleport: 4000,
        useMainComponentOnly: true,
        defaultTargetMeshOptions: {
          teleportationFillColor: "#55FF99",
          teleportationBorderColor: "blue",
          torusArrowMaterial: ground.material,
        },
      },
      true,
      true
    ) as WebXRMotionControllerTeleportation;
    teleportation.parabolicRayEnabled = true;
    teleportation.parabolicCheckRadius = 2;
  }

  /**
   * Creates the xr camera and its transformation based on the nonVRCamera transformation
   * @param   scene
   *          the given scene
   * @param   nonVRcamera
   *          the non vr scene camera for transitation to xr camera
   */
  async createXRCamera(scene: Scene, nonVRcamera: FreeCamera) {
    //ground
    var groundMat = new StandardMaterial("groundMat", scene);
    groundMat.emissiveColor = new Color3(0.5, 0.5, 0.5);
    const ground = MeshBuilder.CreateGround("ground", {
      width: 40,
      height: 30,
    });
    ground.position.y = -1.0;
    ground.material = groundMat;

    //var ground = this.scene.getMeshByName("ground");
    //console.log("found:" + ground.name);
    this.xrPromise = scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-vr",
      },
      floorMeshes: [ground],
    });

    this.xrPromise.then((xr) => {
      xr.baseExperience.camera.setTransformationFromNonVRCamera(nonVRcamera);
      const featureManager = xr.baseExperience.featuresManager;
      //locomotion
      this.locomotion = new Locomotion(xr, featureManager, ground);
    });

    //only for debugging
    //(window as any).xr = xr;
  }
}
