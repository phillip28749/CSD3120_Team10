import { ActionManager, Color3, ExecuteCodeAction, Mesh, MeshBuilder, Scene, Space, StandardMaterial, TransformNode, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

type TriggerAction = () => void;

export class SceneButton extends TransformNode
{
    btnPlane: Mesh
    btnMat: StandardMaterial

    textPlane: Mesh
    textBlock: TextBlock

    constructor(id: string, scene: Scene, 
        triggerCB: TriggerAction,
        position: Vector3,
        textOptions?: { text?: string, color?: string, outlineColor?: string, outlineWidth?: number, fontFamily?: string, fontSize?: number },
        buttonOptions?:{ emissiveColor?: Color3, width?: number, height?: number},){
        super("PBtn")

        //plane btn background
        this.btnMat = new StandardMaterial("btnPlaneMat", scene);
        this.btnMat.backFaceCulling = false; // disable backface culling
        this.btnMat.emissiveColor = buttonOptions?.emissiveColor?? new Color3(0.0, 0.0, 0.0);
        
        this.btnPlane = MeshBuilder.CreatePlane("btnPlane:", {
          width: buttonOptions?.width?? 1.5,
          height: buttonOptions?.height?? 1.5,
        });
        this.btnPlane.material = this.btnMat;
        this.btnPlane.setParent(this);
    
        //Text
        this.textPlane = MeshBuilder.CreatePlane("btnTextPlane:", {
            width: buttonOptions?.width?? 1.5,
            height: buttonOptions?.height?? 1.5,
        });
        var texture = AdvancedDynamicTexture.CreateForMesh(this.textPlane);
        this.textBlock = new TextBlock(id + "btnText");
        this.textBlock.text = textOptions?.text?? id;
        this.textBlock.color = textOptions?.color?? "white";
        this.textBlock.outlineColor = textOptions?.outlineColor?? "black";
        this.textBlock.outlineWidth = textOptions?.outlineWidth?? 30;
        this.textBlock.fontFamily = textOptions?.fontFamily?? "Bold Arial";
        this.textBlock.fontSize = textOptions?.fontSize?? 300;
        this.textBlock.resizeToFit = true;
        this.textBlock.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        this.textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        texture.addControl(this.textBlock);
        this.textPlane.setParent(this);

        // create an action to handle the click event
        const clickAction = new ExecuteCodeAction(
          ActionManager.OnPickTrigger,
          () => {
            triggerCB()
          }
        );
        // add the click action to the actionManager
        this.btnPlane.actionManager = new ActionManager(scene);
        this.btnPlane.actionManager.registerAction(clickAction);
    
        //Scene Button properties
        this.position = position;
        this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
        this.rotate(Vector3.Left(), -Math.PI * 0.5, Space.LOCAL);
        this.scaling = new Vector3(0.1, 0.05, 1);
    }
}