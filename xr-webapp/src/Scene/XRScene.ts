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
  MoleculeInZone,
} from "../Component/index";
import { SceneCamera } from "../Camera/SceneCamera";
import { ParticleEvent } from "../Events/index";
import { GLOBAL } from "../Global";
import { Collision } from "../Physics/Collision";

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

  reactionParent: AbstractMesh;
  reactionBtn: SceneButton;
  reactionResetBtn: SceneButton;
  reactionZone: ReactionZone; // the mesh representation for the scene's reaction zone
  reactionPanel: DisplayPanel;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.moleculeMg = new MoleculeManager(this);

    this.reactionParent = null;
    this.reactionBtn = null;
    this.reactionResetBtn = null;
    this.reactionPanel = null;
    this.reactionZone = null;

    this.pickedMesh = null;
    this.canvas = canvas;
    this.pEvent = new ParticleEvent();
    this.scene = new Scene(engine);
    this.sceneCam = new SceneCamera(this.scene, this.canvas);

    //Original Position
    this.sceneCam.camera.position = new Vector3(0.9, 1.28, -0.07)
    this.sceneCam.camera.target = new Vector3(1.45, 1.2, -0.09)

    //Position of the table
    //this.sceneCam.camera.position = new Vector3(4.61, 1.84, -0.14);
    //this.sceneCam.camera.target = new Vector3(8.21, -0.13, -0.1);

    this.LoadEnvironment();
    this.LoadMolecules();
    this.CreateReactionUI();

    //create particles event for reaction effect
    this.pEvent.init(this.scene);
  }

  OnUpdate()
  {
    switch (this.moleculeMg.molInZone) {
      case MoleculeInZone.Reactant: {
        this.reactionBtn.textString.textBlock.text = "JOIN"
        break;
      }
      case MoleculeInZone.Reaction: {
        this.reactionBtn.textString.textBlock.text = "BREAK"
        break;
      }
      default: {
        this.reactionBtn.textString.textBlock.text = "REACT"
        break;
      }
    }
    Collision.OnCollision(this)
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

    let zReactant: number = 0.3;
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
            m.label = new MoleculeLabel(moleculeName, new Vector3(0, -0.8, 0));
            m.label.plane.setParent(m.mesh);

            //mesh component setup part
            mesh.name = "Molecule:" + moleculeName;
            //both are consider part of molecule id
            m.uniqueIds.push(m.label.plane.uniqueId, mesh.uniqueId);

            m.mesh.position = new Vector3(5.7, 0.88, zReactant);
            m.mesh.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.rotate(Vector3.Left(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.scaling = new Vector3(0.1, 0.1, 0.1);
            zReactant -= 0.15;

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

    let zReaction: number = 0.28;
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
            m.label = new MoleculeLabel(moleculeName, new Vector3(0, -1.4, 0), {
              text: moleculeName,
            });
            m.label.plane.setParent(m.mesh);

            //mesh
            mesh.name = "Molecule:" + moleculeName;
            //both are consider part of molecule id
            m.uniqueIds.push(m.label.plane.uniqueId, mesh.uniqueId);

            m.mesh.position = new Vector3(5.9, 0.85, zReaction);
            m.mesh.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.rotate(Vector3.Left(), Math.PI * 0.5, Space.LOCAL);
            m.mesh.scaling = new Vector3(0.08, 0.08, 0.08);
            zReaction -= 0.25;

            //put each child id into the molecule obj id
            mesh.getChildMeshes().forEach((child) => {
              m.uniqueIds.push(child.uniqueId);
            });
            //mesh.setEnabled(false);
            this.moleculeMg.pushReactions(m);
          }
        });
      });
    });
  }

  CreateDefaultMolecules() {
    //Join Default Molecules
    let z: number = 0.28;
    this.moleculeMg.getAllReactants().forEach((m) => {});

    this.moleculeMg.getAllReactions();

    //Break Default Molecules
  }

  /**
   * Creates and setup the interaction buttons in the scene
   *
   */
  CreateReactionBtns() {
    //Reset Reactions
    const onResetClick = () => {
      GLOBAL.print("Reset clicked");
      this.moleculeMg.ResetReactList();
    };
    this.reactionResetBtn = new SceneButton(
      "reactionResetBtn",
      this.scene,
      onResetClick,
      new Vector3(-0.2, 0, -0.1),
      { text: "RESET", fontSize: 300, outlineWidth: 30 },
      { emissiveColor: new Color3(0.5, 0.0, 0.0) }
    );
    this.reactionResetBtn.setParent(this.reactionParent);

    //Reaction
    const onReactClick = () => {
      switch (this.moleculeMg.molInZone) {
        case MoleculeInZone.Reactant: {
          GLOBAL.print("Join clicked");
          let result = this.moleculeMg.getJoinResult();
          if (result != null) {
            GLOBAL.print("Reaction:" + result.name);
            this.reactionPanel.AddNewText(result.name + "result", {
              text: "RESULT: " + result.name,
              fontSize: 100,
              outlineWidth: 10,
              color: "green",
              position: new Vector3(0, 0.35, 0),
            });
            this.reactionPanel.AddNewMolecule(
              result.name,
              this.moleculeMg,
              new Vector3(0, -0.1, -0.2)
            );
    
            // const allResult = this.moleculeMg.getAllReactions();
            // //disable all
            // for (let r of allResult) r.mesh.setEnabled(false);
    
            // start the particle system effect
            this.pEvent.start();
            //enable only for selected for this reaction
            //result.mesh.setEnabled(true);
          } else {
            this.moleculeMg.ResetReactList();
            this.reactionPanel.AddNewText("failResult", {
              text: "RESULT: FAILED!",
              fontSize: 100,
              outlineWidth: 10,
              color: "red",
            });
          }
          break;
        }
        case MoleculeInZone.Reaction: {
          GLOBAL.print("Break clicked");

          var xOffset : number = -1.6;
          let results = this.moleculeMg.getBreakResult();
          this.moleculeMg.ResetReactList();
          this.reactionPanel.AddNewText("result", {
            text: "RESULT: ",
            fontSize: 100,
            outlineWidth: 10,
            color: "green",
            position: new Vector3(xOffset, 0.35, 0),
          });

          for(let i = 0; i < results.length; ++i)
          { 
            GLOBAL.print("Reactant:" + results[i].name);

            this.reactionPanel.AddNewMolecule(
              results[i].name,
              this.moleculeMg,
              new Vector3(xOffset + i * 0.4, -0.1, -0.2)
          );
          this.pEvent.start();
          
          }
          break;
        }
        default: {
          break;
        }
      }

     
    };
    this.reactionBtn = new SceneButton(
      "reactionBtn",
      this.scene,
      onReactClick,
      new Vector3(-0.2, 0, 0.1),
      { text: "REACT", fontSize: 300, outlineWidth: 30 },
      { emissiveColor: new Color3(0.0, 0.5, 0.0) }
    );
    this.reactionBtn.setParent(this.reactionParent);
  }

  CreateReactionZone() {
    //create reaction zone
    this.reactionZone = new ReactionZone("JoinZone", new Vector3(0, 0, 0), {
      color: new Color3(0.5, 0.5, 0.0),
      transparency: 0.5,
      diameter: 0.25,
    });
    this.reactionZone.setParent(this.reactionParent);
  }

  CreateReactionPanel() {
    //create display panel for the reaction
    this.reactionPanel = new DisplayPanel(
      "reactionPanel",
      this.scene,
      new Vector3(0.2, 0.2, 0.27),
      { color: Color3.Blue(), transparency: 0.3, width: 4 }
    );
    this.reactionPanel.scaling.setAll(0.3);
    this.reactionPanel.setParent(this.reactionParent);

    this.reactionPanel.AddNewText("reactionHeader", {
      text: "CHECK REACTION",
      fontSize: 100,
      outlineWidth: 10,
      position: new Vector3(-1.3, 0.6, 0),
    });
  }

  CreateReactionUI() {
    this.reactionParent = new AbstractMesh("reactionParent");
    this.CreateReactionZone();
    this.CreateReactionPanel();
    this.CreateReactionBtns();
    this.reactionParent.position = new Vector3(5.85, 0.83, -0.33);
  }
}
