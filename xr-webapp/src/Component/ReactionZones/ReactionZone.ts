import { AbstractMesh, ActionManager, Color3, ExecuteCodeAction, Mesh, MeshBuilder, Scene, Space, StandardMaterial, TransformNode, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export class ReactionZone extends TransformNode
{
    mesh: AbstractMesh
    mat : StandardMaterial

    constructor(name: string, position: Vector3,
        zoneOptions?:{ color?: Color3, transparency?: number, diameter?: number})
    {
        super("PReactionZone")

        this.mat = new StandardMaterial("reactionMat");
        this.mat.emissiveColor = zoneOptions.color?? new Color3(0.0, 0.0, 0.0);
        this.mat.alpha = zoneOptions.transparency?? 1.0;

        this.mesh = MeshBuilder.CreateSphere(name + "reactionSphere", {
        diameter: zoneOptions.diameter?? 1.0,
        });
        this.mesh.position = position;
        this.mesh.material = this.mat;
        this.mesh.isPickable = false;
        this.mesh.checkCollisions = true;
        this.mesh.setParent(this)
    }
}