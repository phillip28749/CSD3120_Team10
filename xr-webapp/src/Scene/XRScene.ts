import {
  AbstractMesh,
  Color3,
  CubeTexture,
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Nullable,
  Scene,
  SceneLoader,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
  WebXRDefaultExperience,
} from "babylonjs";
import {
  Molecule,
  MoleculeLabel,
  MoleculeManager,
  SceneButton,
  ReactionZone,
  DisplayPanel,
} from "../Component/index";
import { SceneCamera } from "../Camera/SceneCamera";
import { ParticleEvent } from "../Events/index";
import { GLOBAL } from "../Global";

export class XRScene {
  canvas: HTMLCanvasElement;

  scene: Scene;
  sceneCam: SceneCamera;
  skybox: Mesh;
  hemLight: HemisphericLight;
  pEvent: ParticleEvent;

  xrPromise: Promise<WebXRDefaultExperience>; // xr experience obj
  pickedMesh: Nullable<AbstractMesh>; // the mesh currently picked (attached under xrcontroller pointer / mouse pointer)

  private _moleculeMg: MoleculeManager; // molecule object manager
  public get moleculeMg(): MoleculeManager {
    return this._moleculeMg;
  }
  public set moleculeMg(value: MoleculeManager) {
    this._moleculeMg = value;
  }

  joinReactionParent: AbstractMesh;
  joinBtn: SceneButton;
  joinResetBtn: SceneButton;
  joinReactionZone: ReactionZone; // the mesh representation for the scene's reaction zone
  joinPanel: DisplayPanel;

  breakReactionParent: AbstractMesh;
  breakBtn: SceneButton;
  breakResetBtn: SceneButton;
  breakReactionZone: ReactionZone; // the mesh representation for the scene's reaction zone
  breakPanel: DisplayPanel;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.moleculeMg = new MoleculeManager(this);

    this.joinReactionParent = null;
    this.joinBtn = null;
    this.joinResetBtn = null;
    this.joinPanel = null;
    this.joinReactionZone = null;
    
    this.breakReactionParent = null;
    this.breakBtn = null;
    this.breakResetBtn = null;
    this.breakPanel = null;
    this.breakReactionZone = null;

    this.pickedMesh = null;
    this.canvas = canvas;
    this.pEvent = new ParticleEvent();
    this.scene = new Scene(engine);
    this.sceneCam = new SceneCamera(this.scene, this.canvas);

    //Original Position
    // this.sceneCam.camera.position = new Vector3(0.9, 1.28, -0.07)
    // this.sceneCam.camera.target = new Vector3(1.45, 1.2, -0.06)

    //Position of the table
    this.sceneCam.camera.position = new Vector3(4.61, 1.84, -0.14)
    this.sceneCam.camera.target = new Vector3(8.21, -0.13, -0.1)

    this.LoadEnvironment();
    this.LoadMolecules();
    this.CreateReactionUI();

    //create particles event for reaction effect
    this.pEvent.init(this.scene);
  }

  LoadEnvironment() {
    this.CreateSkyBox();
    this.CreateLight();

    //Classroom
    SceneLoader.ImportMeshAsync("", "models/classroom/", "classroom.gltf");
  }

  /**
   * Create a skybox for the scene
   * @param scene the given scene to create the skybox
   */
  CreateSkyBox() {
    /* Skybox */
    this.skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
    this.skybox.isPickable = false;

    /* Skybox Material */
    // files defines the six files to load for the different faces in that order: px, py, pz, nx, ny, nz
    const paths = [
      "/cubemap/px.png",
      "/cubemap/py.png",
      "/cubemap/pz.png",
      "/cubemap/nx.png",
      "/cubemap/ny.png",
      "/cubemap/nz.png",
    ];
    const ext = [".png"];
    var skyboxMaterial = new StandardMaterial("skyBoxMat", this.scene);
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "assets",
      this.scene,
      ext,
      false,
      paths
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.backFaceCulling = false;
    this.skybox.material = skyboxMaterial;

    // Set the skybox as the scene's environment texture
    this.scene.environmentTexture = skyboxMaterial.reflectionTexture;
    this.scene.ambientColor = new Color3(0.3, 0.3, 0.3);
  }

  CreateLight() {
    this.hemLight = new HemisphericLight(
      "Hemi",
      new Vector3(0, -1, 0),
      this.scene
    );
    this.hemLight.diffuse = new Color3(0.5, 0.5, 0.5);
    this.hemLight.groundColor = new Color3(0.3, 0.3, 0.3);
  }

  /**
   * Loads and setup the environment and molecule meshes
   * @param scene the given scene to load in
   */
  LoadMolecules() {
    //load molecules
    const moleculesReactants = ["C.glb", "H2.glb", "O2.glb"];
    const moleculesResults = ["C6H6.glb", "CO2.glb"];

    let z: number = 0.28;
    moleculesReactants.forEach((filePath) => {
      SceneLoader.ImportMeshAsync("", "models/", filePath).then((result) => {
        result.meshes.forEach((mesh) => {
          if (mesh.parent === null) {
            // is root
            const strIndex = filePath.lastIndexOf(".");
            const moleculeName = filePath.substring(0, strIndex);
            var m: Molecule = new Molecule(moleculeName, mesh);
            //GLOBAL.print(moleculeName);

            //text component part
            m.label = new MoleculeLabel(moleculeName, new Vector3(0, 1, 0));
            m.label.plane.setParent(m.mesh);

            //mesh component setup part
            mesh.name = "Molecule:" + moleculeName;
            //both are consider part of molecule id
            m.uniqueIds.push(m.label.plane.uniqueId, mesh.uniqueId);

            m.mesh.position = new Vector3(5.8, 0.88, z);
            m.mesh.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.rotate(Vector3.Left(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.scaling = new Vector3(0.1, 0.1, 0.1);
            z -= 0.15;

            //put each child id into the molecule obj id
            mesh.getChildMeshes().forEach((child) => {
              m.uniqueIds.push(child.uniqueId);
            });
            //add the molecule to the manager as master molecule object
            this.moleculeMg.pushJoinReactants(m);
          }
        });
      });
    });

    moleculesResults.forEach((filePath) => {
      SceneLoader.ImportMeshAsync("", "models/", filePath).then((result) => {
        result.meshes.forEach((mesh) => {
          if (mesh.parent === null) {
            // is root
            const strIndex = filePath.lastIndexOf(".");
            const moleculeName = filePath.substring(0, strIndex);
            var m: Molecule = new Molecule(moleculeName, mesh);
            //GLOBAL.print(moleculeName);

            //text
            m.label = new MoleculeLabel(moleculeName, new Vector3(0, 1, 0), {
              text: "Result:" + moleculeName,
            });
            m.label.plane.setParent(m.mesh);

            //mesh
            mesh.name = "Molecule:" + moleculeName;
            //both are consider part of molecule id
            m.uniqueIds.push(m.label.plane.uniqueId, mesh.uniqueId);

            m.mesh.position = new Vector3(5.65, 0.88, 0.2);
            m.mesh.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.rotate(Vector3.Left(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.scaling = new Vector3(0.08, 0.08, 0.08);

            //put each child id into the molecule obj id
            mesh.getChildMeshes().forEach((child) => {
              m.uniqueIds.push(child.uniqueId);
            });
            mesh.setEnabled(false);
            this.moleculeMg.pushJoinResult(m);
          }
        });
      });
    });
  }

  /**
   * Creates and setup the interaction buttons in the scene
   *
   */
  CreateJoinBtns() {
    //Reset Join
    const onResetClick = () => {
      GLOBAL.print("Reset clicked");
      this.moleculeMg.clearJoinReactionList();
    };
    this.joinResetBtn = new SceneButton(
      "joinResetBtn",
      this.scene,
      onResetClick,
      new Vector3(-0.2, 0, -0.1),
      { text: "RESET", fontSize: 300, outlineWidth: 30, },
      { emissiveColor: new Color3(0.5, 0.0, 0.0) }
    );
    this.joinResetBtn.setParent(this.joinReactionParent);

    //Join Reaction
    const onJoinClick = () => {
      GLOBAL.print("Join clicked");
      let result = this.moleculeMg.getJoinResult();
      if (result != null) {
        GLOBAL.print("Reaction:" + result.name);
        this.joinPanel.AddNewText(result.name + "result", { text: "RESULT: " + result.name, fontSize: 100, outlineWidth: 10, color: "green" })
        
        const allResult = this.moleculeMg.getAllJoinResults();
        //disable all
        for (let r of allResult) r.mesh.setEnabled(false);

        // start the particle system effect
        this.pEvent.start();
        //enable only for selected for this reaction
        result.mesh.setEnabled(true);
      }
      else{
        this.moleculeMg.clearJoinReactionList();
        this.joinPanel.AddNewText("failResult", { text: "RESULT: FAILED!", fontSize: 100, outlineWidth: 10, color: "red" })
      }
    };
    this.joinBtn = new SceneButton(
      "joinBtn",
      this.scene,
      onJoinClick,
      new Vector3(-0.2, 0, 0.1),
      { text: "JOIN", fontSize: 300, outlineWidth: 30, },
      { emissiveColor: new Color3(0.0, 0.5, 0.0) }
    );
    this.joinBtn.setParent(this.joinReactionParent);
  }

  CreateJoinReactionZone() {
    //create reaction zone
    this.joinReactionZone = new ReactionZone("JoinZone", new Vector3(0, 0, 0), {
      color: new Color3(0.5, 0.5, 0.0),
      transparency: 0.5,
      diameter: 0.25,
    });
    this.joinReactionZone.setParent(this.joinReactionParent);
  }

  CreateJoinPanel() {
    //create display panel for the reaction
    this.joinPanel = new DisplayPanel(
      "JoinPanel",
      this.scene,
      new Vector3(0.2, 0.2, 0),
      { color: Color3.Blue(), transparency: 0.3 }
    );
    this.joinPanel.scaling.setAll(0.3);
    this.joinPanel.setParent(this.joinReactionParent);

    this.joinPanel.AddNewText("joinHeader", { text: "REACTION LIST", fontSize: 100, outlineWidth: 10, position: new Vector3(0.0, 0.6, 0) })
  }

  
  CreateBreakBtns() {
    //Reset Break
    const onResetClick = () => {
      GLOBAL.print("Reset clicked");
      this.moleculeMg.clearJoinReactionList();
    };
    this.breakResetBtn = new SceneButton(
      "breakResetBtn",
      this.scene,
      onResetClick,
      new Vector3(-0.2, 0, -0.1),
      { text: "RESET", fontSize: 300, outlineWidth: 30, },
      { emissiveColor: new Color3(0.5, 0.0, 0.0) }
    );
    this.breakResetBtn.setParent(this.breakReactionParent);

    //Break Reaction
    const onBreakClick = () => {
      GLOBAL.print("Break clicked");
      let result = this.moleculeMg.getJoinResult();
      if (result != null) {
        GLOBAL.print("Reaction:" + result.name);
        const allResult = this.moleculeMg.getAllJoinResults();
        //disable all
        for (let r of allResult) r.mesh.setEnabled(false);

        // start the particle system effect
        this.pEvent.start();
        //enable only for selected for this reaction
        result.mesh.setEnabled(true);
      }
    };
    this.breakBtn = new SceneButton(
      "breakBtn",
      this.scene,
      onBreakClick,
      new Vector3(-0.2, 0, 0.1),
      { text: "BREAK", fontSize: 300, outlineWidth: 30, },
      { emissiveColor: new Color3(0.0, 0.5, 0.0) }
    );
    this.breakBtn.setParent(this.breakReactionParent);
  }

  CreateBreakReactionZone() {
    //create reaction zone
    this.breakReactionZone = new ReactionZone("breakZone", new Vector3(0, 0, 0), {
      color: new Color3(0.5, 0.5, 0.0),
      transparency: 0.5,
      diameter: 0.25,
    });
    this.breakReactionZone.setParent(this.breakReactionParent);
  }

  CreateBreakPanel() {
    //create display panel for the reaction
    this.breakPanel = new DisplayPanel(
      "breakPanel",
      this.scene,
      new Vector3(0.2, 0.2, 0),
      { color: Color3.Blue(), transparency: 0.3 }
    );
    this.breakPanel.scaling.setAll(0.3);
    this.breakPanel.setParent(this.breakReactionParent);

    this.breakPanel.AddNewText("breakHeader", { text: "REACTION LIST", fontSize: 100, outlineWidth: 10, position: new Vector3(0.0, 0.6, 0) })
  }

  CreateReactionUI() {
    this.joinReactionParent = new AbstractMesh("joinReactionParent");
    this.CreateJoinReactionZone();
    this.CreateJoinPanel();
    this.CreateJoinBtns();
    this.joinReactionParent.position = new Vector3(5.85, 0.83, -0.33);
    
    // this.breakReactionParent = new AbstractMesh("breakReactionParent");
    // this.CreateBreakReactionZone();
    // this.CreateBreakPanel();
    // this.CreateBreakBtns();
    // this.breakReactionParent.position = new Vector3(5.85, 0.83, -0.33);
  }
}
