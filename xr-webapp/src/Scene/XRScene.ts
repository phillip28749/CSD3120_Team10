import {
  AbstractMesh,
  ActionManager,
  Animation,
  AnimationGroup,
  Color3,
  CubeTexture,
  Engine,
  ExecuteCodeAction,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  Nullable,
  PointerEventTypes,
  Scene,
  SceneLoader,
  Sound,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
  VideoTexture,
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
  Indicator,
  TextString,
} from "../Component/index";
import { SceneCamera } from "../Camera/SceneCamera";
import { ParticleEvent } from "../Events/index";
import { GLOBAL } from "../Global";
import { Collision } from "../Physics/Collision";
import { AuthoringData } from "xrauthor-loader";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
import { Locomotion } from "../Input";

export class XRScene {
  canvas: HTMLCanvasElement;
  locomotion: Locomotion;
  authorData: AuthoringData;

  scene: Scene;
  sceneCam: SceneCamera;
  skybox: Mesh;
  hemLight: HemisphericLight;

  xrPromise: Promise<WebXRDefaultExperience>; // xr experience obj
  pickedMesh: Nullable<AbstractMesh>; // the mesh currently picked (attached under xrcontroller pointer / mouse pointer)

  private _moleculeMg: MoleculeManager; // molecule object manager
  public get moleculeMg(): MoleculeManager {
    return this._moleculeMg;
  }
  public set moleculeMg(value: MoleculeManager) {
    this._moleculeMg = value;
  }

  grabIndicator: Indicator;
  reactIndicator: Indicator;
  breakIndicator: Indicator;
  observeIndicator: Indicator;
  reactantsIndicator: Indicator;
  reactionsIndicator: Indicator;

  reactionParent: AbstractMesh;
  reactionBtn: SceneButton;
  reactionResetBtn: SceneButton;
  reactionZone: ReactionZone; // the mesh representation for the scene's reaction zone
  reactionPanel: DisplayPanel;

  loadedOtherData: Boolean;

  grabTutDone: Boolean; //Action based
  dropTutDone: Boolean; //Action based
  breakTutDone: Boolean; //Action based
  observeTutDone: Boolean; //Time based
  finalTutDone: Boolean; //Time based

  constructor(
    engine: Engine,
    canvas: HTMLCanvasElement,
    authorData: AuthoringData
  ) {
    this.moleculeMg = new MoleculeManager(this);

    this.pickedMesh = null;
    this.canvas = canvas;
    this.authorData = authorData;
    this.scene = new Scene(engine);
    this.sceneCam = new SceneCamera(this.scene, this.canvas);
    this.locomotion = null;

    this.loadedOtherData = false;
    this.grabTutDone = false;
    this.dropTutDone = false;
    this.breakTutDone = false;
    this.finalTutDone = false;

    if (GLOBAL.DEBUG_MODE) {
      //Position of the table
      this.sceneCam.camera.position = new Vector3(4.61, 1.84, -0.14);
      this.sceneCam.camera.target = new Vector3(8.21, -0.13, -0.1);
    } else {
      //Original Position
      this.sceneCam.camera.position = new Vector3(0.9, 1.28, -0.07);
      this.sceneCam.camera.target = new Vector3(1.45, 1.2, -0.09);
    }

    this.LoadEnvironment();
    this.LoadMolecules();
    this.CreateReactionUI();
    this.AddSounds();
  }

  AddSounds() {
    const music = new Sound("music", "/sounds/bgm.m4a", this.scene, null, {
      loop: true,
      autoplay: true,
    });
  }

  SetLocomotion(locomotion: Locomotion) {
    this.locomotion = locomotion;
  }

  OnUpdate() {
    switch (this.moleculeMg.molInZone) {
      case MoleculeInZone.Reactant: {
        this.reactionBtn.textString.textBlock.text = "JOIN";
        break;
      }
      case MoleculeInZone.Reaction: {
        this.reactionBtn.textString.textBlock.text = "BREAK";
        break;
      }
      default: {
        this.reactionBtn.textString.textBlock.text = "REACT";
        break;
      }
    }
    Collision.OnCollision(this);
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
    let totalSize: number = moleculesReactants.length + moleculesResults.length;

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

            totalSize--;
          }
        });

        if (totalSize <= 0 && !this.loadedOtherData) {
          this.AfterMoleculeLoaded();
          this.loadedOtherData = true;
        }
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

            totalSize--;
          }
        });

        if (totalSize <= 0 && !this.loadedOtherData) {
          this.AfterMoleculeLoaded();
          this.loadedOtherData = true;
        }
      });
    });
  }

  AfterMoleculeLoaded() {
    this.CreateXRAuthorVideo(0.82, new Vector3(7.15, 1.51, 0), this.scene);

    this.CreateIndicators();
  }

  /**
   * Creates and setup the interaction buttons in the scene
   *
   */
  CreateReactionBtns() {
    //Reset Reactions
    const onResetClick = () => {
      GLOBAL.print("Reset clicked");
      if(this.dropTutDone && !this.breakTutDone)
        {
          this.dropTutDone = false
          this.grabTutDone = false;
          this.grabIndicator.Show();
          this.reactIndicator.Hide();
          this.breakIndicator.Hide();
        }
      this.moleculeMg.ResetReactList();
    };
    this.reactionResetBtn = new SceneButton(
      "reactionResetBtn",
      this,
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
            const mol = this.reactionPanel.AddNewMolecule(
              result.name,
              this.moleculeMg,
              new Vector3(0, -0.1, -0.2)
            );
            const particles = new ParticleEvent();
            particles.init(this.scene, mol?.mesh);
            particles.particleSystem.createSphereEmitter(0.7, 2.5);
            particles.setDuration(100);
            particles.start();
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
          if(!this.breakTutDone && this.dropTutDone)
          {
            this.breakTutDone = true
            this.breakIndicator.Hide()
            this.observeIndicator.Show()

            setTimeout(() => {
              this.observeTutDone = true;
              this.observeIndicator.Hide();
              this.reactantsIndicator.Show();
              this.reactionsIndicator.Show();

              setTimeout(() => {
                this.finalTutDone = true;
                this.reactantsIndicator.Hide();
                this.reactionsIndicator.Hide();
              },5000)
            }, 5000);
            
          }

          GLOBAL.print("Break clicked");

          var xOffset: number = -1.6;
          let results = this.moleculeMg.getBreakResult();
          this.moleculeMg.ResetReactList();
          this.reactionPanel.AddNewText("result", {
            text: "RESULT: ",
            fontSize: 100,
            outlineWidth: 10,
            color: "green",
            position: new Vector3(xOffset, 0.35, 0),
          });

          for (let i = 0; i < results.length; ++i) {
            GLOBAL.print("Reactant:" + results[i].name);

            const mol = this.reactionPanel.AddNewMolecule(
              results[i].name,
              this.moleculeMg,
              new Vector3(xOffset + i * 0.4, -0.1, -0.2)
            );

            const particles = new ParticleEvent();
            particles.init(this.scene, mol?.mesh);
            particles.particleSystem.createSphereEmitter(0.7, 2.5);
            particles.setDuration(100);
            particles.start();
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
      this,
      onReactClick,
      new Vector3(-0.2, 0, 0.1),
      { text: "REACT", fontSize: 300, outlineWidth: 30 },
      { emissiveColor: new Color3(0.0, 0.5, 0.0) }
    );
    this.reactionBtn.setParent(this.reactionParent);
  }

  CreateReactionZone() {
    //create reaction zone
    this.reactionZone = new ReactionZone(
      "JoinZone",
      new Vector3(0, 0, 0),
      this,
      {
        color: new Color3(0.5, 0.5, 0.0),
        transparency: 0.5,
        diameter: 0.25,
      }
    );
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

  CreateIndicators() {
    const outlineWidth = 10;

    let reactionPointerY = 0.87;
    const reactantList = this.moleculeMg.getAllReactants();
    for (let i = 0; i < reactantList.length; ++i) {
      if (reactantList[i].label.textBlock.text === "C") {
        let pos = reactantList[i].mesh.getAbsolutePosition();

        //Reactant indicator
        this.reactantsIndicator = new Indicator(
          "reactantsIndicator",
          this.scene,
          new Vector3(pos.x - 0.07, reactionPointerY, pos.z + 0.25),
          { color: Color3.Gray() },
          { text: "REACTANTS", color: "orange", outlineWidth: outlineWidth }
        );
        this.reactantsIndicator.rotate(
          Vector3.Up(),
          -Math.PI * 0.5,
          Space.LOCAL
        );
        this.reactantsIndicator.rotate(
          Vector3.Right(),
          Math.PI * 0.5,
          Space.LOCAL
        );
        this.reactantsIndicator.rotate(
          Vector3.Forward(),
          Math.PI * 0.15,
          Space.LOCAL
        );
        break;
      }
    }

    const reactionList = this.moleculeMg.getAllReactions();
    for (let i = 0; i < reactionList.length; ++i) {
      if (reactionList[i].label.textBlock.text === "CO2") {
        //Grab CO2
        let pos = reactionList[i].mesh.getAbsolutePosition();
        this.grabIndicator = new Indicator(
          "grabIndicator",
          this.scene,
          new Vector3(pos.x, pos.y + 0.3, pos.z),
          { color: Color3.Gray() },
          { text: "GRAB CO2", color: "orange", outlineWidth: outlineWidth }
        );
        this.grabIndicator.Show()

        //Reactions indicator
        this.reactionsIndicator = new Indicator(
          "reactionsIndicator",
          this.scene,
          new Vector3(pos.x + 0.07, reactionPointerY, pos.z + 0.3),
          { color: Color3.Gray() },
          { text: "REACTIONS", color: "orange", outlineWidth: outlineWidth }
        );
        this.reactionsIndicator.rotate(
          Vector3.Up(),
          -Math.PI * 0.5,
          Space.LOCAL
        );
        this.reactionsIndicator.rotate(
          Vector3.Right(),
          Math.PI * 0.5,
          Space.LOCAL
        );
        this.reactionsIndicator.rotate(
          Vector3.Forward(),
          -Math.PI * 0.15,
          Space.LOCAL
        );
        break;
      }
    }

    //Drop into reaction zone
    let reactPos = this.reactionZone.getAbsolutePosition();
    this.reactIndicator = new Indicator(
      "reactIndicator",
      this.scene,
      new Vector3(reactPos.x, reactPos.y + 0.3, reactPos.z),
      { color: Color3.Gray() },
      { text: "DROP HERE", color: "orange", outlineWidth: outlineWidth }
    );

    //Break Molecule
    let breakPos = this.reactionBtn.getAbsolutePosition();
    this.breakIndicator = new Indicator(
      "breakIndicator",
      this.scene,
      new Vector3(breakPos.x, breakPos.y + 0.3, breakPos.z),
      { color: Color3.Gray() },
      { text: "PRESS BUTTON", color: "orange", outlineWidth: outlineWidth }
    );

    //Observe Molecule
    let observePos = this.reactionPanel.getAbsolutePosition();
    this.observeIndicator = new Indicator(
      "observeIndicator",
      this.scene,
      new Vector3(observePos.x, observePos.y + 0.35, observePos.z),
      { color: Color3.Gray() },
      { text: "OBSERVE REACTION", color: "orange", outlineWidth: outlineWidth }
    );
    this.observeIndicator.indText.textBlock.textWrapping = false;
  }

  CreateXRAuthorVideo(videoHeight: number, position: Vector3, scene: Scene) {
    //Video player
    const videoWidth = videoHeight * this.authorData.recordingData.aspectRatio;
    const videoPlane = MeshBuilder.CreatePlane(
      "xrauthorVideoPlane",
      {
        height: videoHeight,
        width: videoWidth,
      },
      scene
    );
    videoPlane.position = position;
    const videoMaterial = new StandardMaterial("xrauthorMaterial", scene);
    const videoTexture = new VideoTexture(
      "xrauthorTexture",
      this.authorData.video,
      scene
    );
    videoTexture.onUserActionRequestedObservable.add(() => {});
    videoMaterial.diffuseTexture = videoTexture;
    videoMaterial.roughness = 1;
    videoMaterial.backFaceCulling = false; // disable backface culling
    videoMaterial.emissiveColor = Color3.White();
    videoPlane.material = videoMaterial;

    //Video Border
    const videoBorderWidth = videoHeight / 20;
    const videoBorderHeight = videoHeight / 5;
    const videoBorderPlane = MeshBuilder.CreatePlane(
      "xrauthorBorderPlane",
      {
        height: videoHeight + videoBorderHeight,
        width: videoWidth + videoBorderWidth,
      },
      scene
    );
    videoBorderPlane.position = videoPlane.position.clone();
    videoBorderPlane.position.z += 0.001;
    var borderMat = new StandardMaterial("borderMat", scene);
    borderMat.emissiveColor = Color3.Gray();
    borderMat.diffuseColor = Color3.Gray();
    borderMat.backFaceCulling = false; // disable backface culling
    videoBorderPlane.material = borderMat;

    //Video Buttons
    const CreateButton = (
      text: string,
      btnWidth: number,
      btnHeight: number,
      triggerCB: () => void,
      position?: Vector3,
      isTransparentBG: Boolean = false
    ): [Mesh, TextBlock] => {
      //Video Play/Pause Button
      const newBtn = MeshBuilder.CreatePlane(
        "btnPlane",
        { width: btnWidth, height: btnHeight },
        scene
      );
      const btnTexture = AdvancedDynamicTexture.CreateForMesh(
        newBtn,
        500,
        200,
        false
      );
      btnTexture.name = "btnTexture";
      if (!isTransparentBG) btnTexture.background = "grey";

      const btnText = new TextBlock();
      btnText.color = "white";

      btnText.outlineColor = "black";
      btnText.outlineWidth = 20;
      btnText.fontSize = 150;
      btnText.fontFamily = "Bold Arial";
      btnText.text = text;
      btnTexture.addControl(btnText);
      newBtn.position = position ?? Vector3.Zero();

      // create an action to handle the click event
      const clickDownAction = new ExecuteCodeAction(
        ActionManager.OnPickDownTrigger,
        () => {
          this.locomotion.disableTeleport();
          triggerCB();
        }
      );
      const clickUpAction = new ExecuteCodeAction(
        ActionManager.OnPickUpTrigger,
        () => {
          this.locomotion.enableTeleport();
        }
      );
      // add the click action to the actionManager
      newBtn.actionManager = new ActionManager(this.scene);
      newBtn.actionManager.registerAction(clickDownAction);
      newBtn.actionManager.registerAction(clickUpAction);

      return [newBtn, btnText];
    };

    const vidBtnWidth = videoBorderWidth * 4;
    const vidBtnHeight = videoBorderHeight / 2;

    //Video Play/Pause Button
    const onPlayPauseClick = () => {
      if (videoTexture.video.paused) {
        playPauseBtn[1].text = "PAUSE";
        videoTexture.video.play();
        animationGroup.play(true);
      } else {
        playPauseBtn[1].text = "PLAY";
        videoTexture.video.pause();
        animationGroup.pause();
      }
    };
    const playPauseBtn = CreateButton(
      "PLAY",
      vidBtnWidth,
      vidBtnHeight,
      onPlayPauseClick
    );
    playPauseBtn[0].position = videoPlane.position.clone();
    playPauseBtn[0].position.y += videoHeight / 2 + vidBtnHeight / 4;

    //Increase/Decrease Video Scaling button
    var currentScaling = 1;

    const onPlusClick = () => {
      if (currentScaling < 3) {
        currentScaling += 0.5;
        videoPlane.scaling.setAll(currentScaling);
      }
    };
    const onMinusClick = () => {
      if (currentScaling > 1) {
        currentScaling -= 0.5;
        videoPlane.scaling.setAll(currentScaling);
      }
    };

    const plusPosition = playPauseBtn[0].position
      .clone()
      .add(new Vector3(0.53, 0, 0));
    const plusBtn = CreateButton(
      "+",
      vidBtnWidth,
      vidBtnHeight,
      onPlusClick,
      plusPosition,
      true
    );

    const minusPosition = plusPosition.add(new Vector3(-0.1, 0, 0));
    const minusBtn = CreateButton(
      "-",
      vidBtnWidth,
      vidBtnHeight,
      onMinusClick,
      minusPosition,
      true
    );

    const offsetLimit = 3
    var maxOffsetLimit = videoPlane.position.x
    var minOffsetLimit = videoPlane.position.x - offsetLimit
    const onUpClick = () => {
      if (videoPlane.position.x > minOffsetLimit) {
        videoPlane.position.x -= 1;
      }
    };
    const onDownClick = () => {
      if (videoPlane.position.x < maxOffsetLimit) {
        videoPlane.position.x += 1;
      }
    };

    const upPosition = playPauseBtn[0].position
      .clone()
      .add(new Vector3(-0.53, 0, 0));
    const upBtn = CreateButton(
      "↑",
      vidBtnWidth,
      vidBtnHeight,
      onUpClick,
      upPosition,
      true
    );

    const downPosition = upPosition.add(new Vector3(0.1, 0, 0));
    const downBtn = CreateButton(
      "↓",
      vidBtnWidth,
      vidBtnHeight,
      onDownClick,
      downPosition,
      true
    );

    videoPlane.position.y += -videoBorderWidth;
    videoBorderPlane.setParent(videoPlane);
    playPauseBtn[0].setParent(videoPlane);
    plusBtn[0].setParent(videoPlane);
    minusBtn[0].setParent(videoPlane);
    upBtn[0].setParent(videoPlane);
    downBtn[0].setParent(videoPlane);
    videoPlane.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);

    //Video Controller
    videoTexture.video.autoplay = false;
    const animationGroup = new AnimationGroup(
      "xrauthor animation group",
      scene
    );

    //XRAuthor Animation
    const tracks = this.authorData.recordingData.animation.tracks;
    const allMol = this.moleculeMg.getAllMolecules();
    for (let id in tracks) {
      const track = this.authorData.recordingData.animation.tracks[id];
      const length = track.times.length;
      const fps = length / this.authorData.recordingData.animation.duration;

      const depth = Math.abs(videoPlane.position.z) - 0.05;
      const scaleForDepth =
        depth / this.authorData.recordingData.videoPlaneDepth;
      const fov = (this.authorData.recordingData.fovInDegrees * Math.PI) / 180;
      const videoHeightFromRecordingAfterDepthScaling =
        Math.tan(fov / 2) * depth * 2;
      const scaleForSize =
        videoHeight / videoHeightFromRecordingAfterDepthScaling;

      const keyFrames = [];
      for (let i = 0; i < length; i++) {
        const mat = Matrix.FromArray(track.matrices[i].elements);
        const pos = mat.getTranslation();
        //convert position from right handed to left handed coords
        pos.z = -pos.z;
        keyFrames.push({
          frame: track.times[i] * fps,
          value: pos
            .scale(scaleForDepth)
            .multiplyByFloats(scaleForSize, scaleForSize, 1),
        });
      }
      const animation = new Animation(
        "animation",
        "position",
        fps,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      animation.setKeys(keyFrames);

      //Loading Models from XRAuthor Video
      const info = this.authorData.recordingData.modelInfo[id];
      const strIndex = info.name.lastIndexOf(".");
      const moleculeName = info.name.substring(0, strIndex);
      for (let i = 0; i < allMol.length; ++i) {
        if (allMol[i].label.textBlock.text === moleculeName) {
          const clonedMol = this.moleculeMg.cloneMesh(allMol[i]);
          clonedMol.rotation = Vector3.Zero();
          clonedMol.rotate(Vector3.Up(), -Math.PI * 0.5, Space.LOCAL);
          clonedMol.setParent(videoPlane);

          animationGroup.addTargetedAnimation(animation, clonedMol);
          animationGroup.reset();
          break;
        }
      }
    }
  }
}
