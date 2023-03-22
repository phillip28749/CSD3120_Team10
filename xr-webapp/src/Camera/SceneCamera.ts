import { FreeCamera, Scene, Vector3 } from "babylonjs";

export class SceneCamera
{
    camera : FreeCamera
    constructor(scene: Scene, canvas: HTMLCanvasElement)
    {
        this.camera = new FreeCamera('camera', new Vector3(0, 0, 0), scene);
        this.camera.attachControl(canvas, true);
        
        // set the camera's position and target
        this.camera.position = new Vector3(5.8, 1.5, 0);
        this.camera.setTarget(this.camera.position.add(new Vector3(0.5, -0.25, 0)));
    }
}