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

  joinReactionParent: AbstractMesh
  joinBtn: SceneButton;
  resetJoinBtn: SceneButton;
  joinReactionZone: ReactionZone; // the mesh representation for the scene's reaction zone
  joinPanel: DisplayPanel;

  breakReactionZone: ReactionZone; // the mesh representation for the scene's reaction zone

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.moleculeMg = new MoleculeManager();

    this.joinReactionParent = null
    this.joinBtn = null
    this.resetJoinBtn = null
    this.joinPanel = null
    this.joinReactionZone = null;
    this.breakReactionZone = null;

    this.pickedMesh = null;
    this.canvas = canvas;
    this.pEvent = new ParticleEvent();
    this.scene = new Scene(engine);
    this.sceneCam = new SceneCamera(this.scene, this.canvas);

    this.CreateLight();
    this.LoadEnvironment();
    this.LoadMolecules();
    this.CreateReactionUI();

    //create particles event for reaction effect
    this.pEvent.init(this.scene);
  }

  LoadEnvironment()
  {
    this.CreateSkyBox();

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
            //console.log(moleculeName);

            //text component part
            m.label = new MoleculeLabel(
              moleculeName,
              new Vector3(0, 1, 0)
            );
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
            this.moleculeMg.pushReactants(m);
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
            //console.log(moleculeName);

            //text
            m.label = new MoleculeLabel(
              moleculeName,
              new Vector3(0, 1, 0),
              { text: "Result:" + moleculeName }
            );
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
            this.moleculeMg.pushResult(m);
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
      console.log("Reset clicked");
      this.moleculeMg.clearReactionList();
    };
    this.resetJoinBtn = new SceneButton(
      "RESET",
      this.scene,
      onResetClick,
      new Vector3( -0.2, 0, -0.1),
      {},
      { emissiveColor: new Color3(0.5, 0.0, 0.0) }
    );
    this.resetJoinBtn.setParent(this.joinReactionParent)

    //Join Reaction
    const onJoinClick = () => {
      console.log("Join clicked");
      let result = this.moleculeMg.getResult();
      if (result != null) {
        console.log("Reaction:" + result.name);
        const allResult = this.moleculeMg.getAllResults();
        //disable all
        for (let r of allResult) r.mesh.setEnabled(false);

        // start the particle system effect
        this.pEvent.start();
        //enable only for selected for this reaction
        result.mesh.setEnabled(true);
      }
    };
    this.joinBtn = new SceneButton(
      "JOIN",
      this.scene,
      onJoinClick,
      new Vector3(-0.2, 0, 0.1),
      {},
      { emissiveColor: new Color3(0.0, 0.5, 0.0) }
    );
    this.joinBtn.setParent(this.joinReactionParent)
  }

  CreateJoinReactionZone()
  {
    //create reaction zone
    this.joinReactionZone = new ReactionZone("JoinZone", new Vector3(0,0,0), { color: new Color3(0.5, 0.5, 0.0), transparency: 0.5, diameter: 0.25})
    this.joinReactionZone.setParent(this.joinReactionParent)
  }

  CreateJoinPanel()
  {
    //create display panel for the reaction
    this.joinPanel = new DisplayPanel("JoinPanel", this.scene, new Vector3(0.2, 0.2, 0), { text: "testing this sentence"}, { color: Color3.Blue(), transparency: 0.5})
    this.joinPanel.scaling.setAll(0.3)
    this.joinPanel.setParent(this.joinReactionParent)
  }

  CreateReactionUI()
  {
    this.joinReactionParent = new AbstractMesh("joinReactionParent")
    this.CreateJoinReactionZone()
    this.CreateJoinPanel()
    this.CreateJoinBtns();
    this.joinReactionParent.position = new Vector3(5.85, 0.83, -0.33)

  }
}
