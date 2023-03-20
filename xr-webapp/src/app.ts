
import { Engine, WebXRMotionControllerTeleportation, Scene, SceneLoader, TransformNode, Vector3, Color3, MeshBuilder, HemisphericLight, StandardMaterial, CubeTexture, Texture, FreeCamera, WebXRFeaturesManager, WebXRDefaultExperience, Space, WebXRFeatureName, ExecuteCodeAction, ActionManager, AbstractMesh } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
import { MoleculeManager, Molecule } from "./MoleculeManager";
import { ParticleEvent } from "./ParticleEvent";
import 'babylonjs-loaders';


export class App {
    private engine: Engine;
    private canvas: HTMLCanvasElement;
    private authorData: any;
    private xrPromise: Promise<WebXRDefaultExperience>;             // xr experience obj
    private moleculeMg: MoleculeManager;                            // molecule object manager
    private reactionZone: AbstractMesh;                            // the mesh representation for the scene's reaction zone
    private xrPointerMesh: AbstractMesh;                           // the mesh currently attached under xrcontroller pointer
    private pEvent : ParticleEvent;
    private scene: Scene;
    constructor(engine: Engine, canvas: HTMLCanvasElement, authorData: any) {

        this.engine = engine;
        this.canvas = canvas;
        this.authorData = authorData;
        this.moleculeMg = new MoleculeManager();
        this.reactionZone = null;
        this.xrPointerMesh = null;
        this.pEvent = new ParticleEvent();
        this.scene = null;

    }

    /**
     * Create a skybox for the scene
     * @param scene the given scene to create the skybox
     */
    createSkyBox(scene: Scene) {
        // Skybox
        var skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
        skybox.isPickable = false;
        var skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        // files defines the six files to load for the different faces in that order: px, py, pz, nx, ny, nz
        const paths = ["/cubemap/px.png", "/cubemap/py.png", "/cubemap/pz.png",
            "/cubemap/nx.png", "/cubemap/ny.png", "/cubemap/nz.png"];
        const ext = [".png"];
        skyboxMaterial.reflectionTexture = new CubeTexture("assets", scene, ext, false, paths);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        // Set the skybox as the scene's environment texture
        scene.environmentTexture = skyboxMaterial.reflectionTexture;
        scene.ambientColor = new Color3(0.3, 0.3, 0.3);

        var light = new HemisphericLight("Hemi", new Vector3(0, -1, 0), scene);
        light.diffuse = new Color3(0.5, 0.5, 0.5);
        light.groundColor = new Color3(0.3, 0.3, 0.3);
    }

    enableInspector(scene: Scene) {
        window.addEventListener("keydown", e => {
            if (e.metaKey && e.shiftKey && e.key === 'i') {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                }
                else {
                    scene.debugLayer.show();
                }

            }
        });
    }
    /**
     * Loads and setup the environment and molecule meshes
     * @param scene the given scene to load in
     */
    setupAllMeshes(scene: Scene) {

        SceneLoader.ImportMeshAsync("", "models/classroom/", "classroom.gltf");
        //load molecules
        const moleculesReactants = ["C.glb", "H2.glb", "O2.glb"];
        const moleculesResults = ["C6H6.glb", "CO2.glb"];

        let z: number = 0.28;
        moleculesReactants.forEach((filePath) => {
            SceneLoader.ImportMeshAsync("", "models/", filePath).then((result) => {

                result.meshes.forEach((mesh) => {

                    if (mesh.parent === null) // is root
                    {
                        const strIndex = filePath.lastIndexOf(".");
                        const moleculeName = filePath.substring(0, strIndex);
                        var m: Molecule = new Molecule(moleculeName, mesh);
                        //console.log(moleculeName);

                        //text component part
                        const plane = MeshBuilder.CreatePlane("plane:" + moleculeName, { width: 2, height: 2 });
                        plane.position = new Vector3(0, 1, 0);
                        //plane.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
                        plane.setParent(m.root);

                        var texture = AdvancedDynamicTexture.CreateForMesh(plane);
                        const textBlock = new TextBlock(moleculeName);
                        textBlock.text = moleculeName;
                        textBlock.color = "white";
                        textBlock.outlineColor = "black";
                        textBlock.outlineWidth = 30;
                        textBlock.fontFamily = "Bold Arial";
                        textBlock.fontSize = 150;
                        textBlock.resizeToFit = true;
                        textBlock.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
                        textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
                        texture.addControl(textBlock);

                        //mesh component setup part
                        mesh.name = "Molecule:" + moleculeName;
                        //both are consider part of molecule id
                        m.uniqueIds.push(plane.uniqueId, mesh.uniqueId);

                        m.root.position = new Vector3(5.8, 0.88, z);
                        m.root.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
                        m.root.rotate(Vector3.Left(), Math.PI * 0.5, Space.LOCAL);
                        m.root.scaling = new Vector3(0.1, 0.1, 0.1);
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

                    if (mesh.parent === null) // is root
                    {
                        const strIndex = filePath.lastIndexOf(".");
                        const moleculeName = filePath.substring(0, strIndex);
                        var m: Molecule = new Molecule(moleculeName, mesh);
                        //console.log(moleculeName);

                        //text
                        const plane = MeshBuilder.CreatePlane("plane:" + moleculeName, { width: 2, height: 2 });
                        plane.position = new Vector3(0, 1, 0);
                        //plane.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
                        plane.setParent(m.root);

                        var texture = AdvancedDynamicTexture.CreateForMesh(plane);
                        const textBlock = new TextBlock(moleculeName);
                        textBlock.text = "Result:" + moleculeName;
                        textBlock.color = "white";
                        textBlock.outlineColor = "black";
                        textBlock.outlineWidth = 30;
                        textBlock.fontFamily = "Bold Arial";
                        textBlock.fontSize = 150;
                        textBlock.resizeToFit = true;
                        textBlock.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
                        textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
                        texture.addControl(textBlock);

                        //mesh
                        mesh.name = "Molecule:" + moleculeName;
                        //both are consider part of molecule id
                        m.uniqueIds.push(plane.uniqueId, mesh.uniqueId);

                        m.root.position = new Vector3(5.65, 0.88, 0.2);
                        m.root.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
                        m.root.rotate(Vector3.Left(), Math.PI * 0.5, Space.LOCAL);
                        m.root.scaling = new Vector3(0.08, 0.08, 0.08);

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

                            if (this.xrPointerMesh != null) // make sure only one item is selected at a time
                                return;

                            if ((mesh = xr.pointerSelection.getMeshUnderPointer(controller.uniqueId))) {
                                //console.log("mesh under controller pointer: " + mesh.name);
                                // only allow picking if its a molecule
                                if (mesh.name.indexOf("Molecule") !== -1) {
                                    const distance
                                        = Vector3.Distance(motionController.rootMesh.getAbsolutePosition(),
                                            mesh.getAbsolutePosition());
                                    if (distance < 1) {
                                        // make sure we can only pick reactants
                                        let m = this.moleculeMg.findReactants(mesh.uniqueId);
                                        if (m) {
                                            this.xrPointerMesh = this.moleculeMg.clone(m); //clone the master mesh
                                            this.xrPointerMesh.setParent(motionController.rootMesh, true); //set under parent controller's mesh
                                            this.moleculeMg.currSelected = m;
                                        }
                                    }
                                }
                            }
                            else {
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
    initLocomotion(xr: WebXRDefaultExperience, featureManager: WebXRFeaturesManager, ground: AbstractMesh) {
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
        const ground = MeshBuilder.CreateGround("ground", { width: 40, height: 30 });
        ground.position.y = -1.0;
        ground.material = groundMat;

        //var ground = this.scene.getMeshByName("ground");
        //console.log("found:" + ground.name);
        this.xrPromise = scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-vr",
            },
            floorMeshes: [ground]
        });

        this.xrPromise.then((xr) => {
            xr.baseExperience.camera.setTransformationFromNonVRCamera(nonVRcamera);
            const featureManager = xr.baseExperience.featuresManager;
            //locomotion
            this.initLocomotion(xr, featureManager, ground);
        });

        //only for debugging
        //(window as any).xr = xr;
    }
    
    /**
     * Creates and setup the interaction buttons in the scene
     * 
     */
    createSceneBtns() {
        let parent1 = new TransformNode("PBtn");
        //plane btn background
        const planeBgMat = new StandardMaterial("planeBG-material", this.scene);
        planeBgMat.backFaceCulling = false; // disable backface culling
        planeBgMat.emissiveColor = new Color3(0.5, 0.0, 0.0);
        const bgPlane = MeshBuilder.CreatePlane("bgPlane:", { width: 1.5, height:  1.5 });
        bgPlane.material = planeBgMat;

        const plane = MeshBuilder.CreatePlane("plane:", { width:  1.5, height:  1.5 });
        var texture = AdvancedDynamicTexture.CreateForMesh(plane);
        const textBlock = new TextBlock("Reset");
        textBlock.text = "Reset";
        textBlock.color = "white";
        textBlock.outlineColor = "black";
        textBlock.outlineWidth = 30;
        textBlock.fontFamily = "Bold Arial";
        textBlock.fontSize = 300;
        textBlock.resizeToFit = true;
        textBlock.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        texture.addControl(textBlock);
        plane.setParent(parent1);
        bgPlane.setParent(parent1);
        parent1.position = new Vector3(5.7, 0.83, -0.33);
        parent1.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
        parent1.rotate(Vector3.Left(), -Math.PI * 0.5, Space.LOCAL);
        parent1.scaling = new Vector3(0.1, 0.05, 1);

        // create an action to handle the click event
        const clickAction = new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
            console.log("Reset clicked");
            this.moleculeMg.clearReactionList();
        });
        // add the click action to the actionManager
        bgPlane.actionManager = new ActionManager(this.scene);
        bgPlane.actionManager.registerAction(clickAction);

        let parent2 = new TransformNode("PBtn");
        //plane btn background
        const planeBgMat2 = new StandardMaterial("planeBG-material", this.scene);
        planeBgMat2.backFaceCulling = false; // disable backface culling
        planeBgMat2.emissiveColor = new Color3(0.0, 0.5, 0.0);
        const bgPlane2 = MeshBuilder.CreatePlane("bgPlane:", { width:  1.5, height:  1.5 });
        bgPlane2.material = planeBgMat2;

        const plane2 = MeshBuilder.CreatePlane("plane:", { width:  1.5, height:  1.5 });
        var texture2 = AdvancedDynamicTexture.CreateForMesh(plane2);
        const textBlock2 = new TextBlock("React");
        textBlock2.text = "React";
        textBlock2.color = "white";
        textBlock2.outlineColor = "black";
        textBlock2.outlineWidth = 30;
        textBlock2.fontFamily = "Bold Arial";
        textBlock2.fontSize = 300;
        textBlock2.resizeToFit = true;
        textBlock2.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock2.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        texture2.addControl(textBlock2);
        plane2.setParent(parent2);
        bgPlane2.setParent(parent2);
        parent2.position = new Vector3(5.7, 0.83, -0.15);
        parent2.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
        parent2.rotate(Vector3.Left(), -Math.PI * 0.5, Space.LOCAL);
        parent2.scaling = new Vector3(0.1, 0.05, 1);

        // create an action to handle the click event
        const clickAction2 = new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
            console.log("React clicked");
            let result = this.moleculeMg.getResult();
            if (result != null) {
                console.log("Reaction:" + result.name);
                const allResult = this.moleculeMg.getAllResults();
                //disable all
                for (let r of allResult)
                    r.root.setEnabled(false);

                // start the particle system effect
                this.pEvent.start();
                //enable only for selected for this reaction
                result.root.setEnabled(true);
            }
        });
        // add the click action to the actionManager
        bgPlane2.actionManager = new ActionManager(this.scene);
        bgPlane2.actionManager.registerAction(clickAction2);

    }

    /**
     * Creates and setup an xr scene
     * @returns xr scene promise
     */
    async createScene() {
        const scene = new Scene(this.engine);
        this.scene = scene;

        // create a free camera
        var camera = new FreeCamera('camera', new Vector3(0, 0, 0), scene);
        camera.attachControl(this.canvas, true);
        // set the camera's position and target
        camera.position = new Vector3(5.8, 1.5, 0);
        camera.setTarget(camera.position.add(new Vector3(0.5, -0.25, 0)));
        //skybox
        this.createSkyBox(scene);

        //load and place meshes
        this.setupAllMeshes(scene);

        //create interactable btns for the scene
        this.createSceneBtns();

        //create xr camera
        this.createXRCamera(scene, camera);
        this.setupControllerInteraction();

        //create particles event for reaction effect
        this.pEvent.init(scene);

        //create reaction zone
        const sphereMat = new StandardMaterial("sphere-mat");
        sphereMat.emissiveColor = new Color3(0.5, 0.5, 0.0);
        this.reactionZone = MeshBuilder.CreateSphere("Reaction Point", { diameter: 0.25 });
        this.reactionZone.position = new Vector3(5.9, 0.83, -0.33);
        this.reactionZone.material = sphereMat;
        this.reactionZone.material.alpha = 0.5;
        this.reactionZone.isPickable = false;


        this.enableInspector(scene);

        return scene;
    }

    /**
     * Update logic of the xr webapp
     * @param   scene 
     *          the current scene 
     */
    update(scene: Scene) {
        this.xrPromise.then((xr) => {

            //reaction zone trigger update
            if (!this.xrPointerMesh)
                return;
            if (this.xrPointerMesh.intersectsMesh(this.reactionZone, false, true)) // reaction trigger logic
            {
                //console.log("Meshes intersecting!");
                this.moleculeMg.addReactionToList(this.moleculeMg.currSelected);
                this.moleculeMg.currSelected = null;
                this.xrPointerMesh.dispose();
                this.xrPointerMesh = null;
            }

        });


    }
}