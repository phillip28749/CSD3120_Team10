import { ActionManager, Color3, ExecuteCodeAction, Mesh, MeshBuilder, Scene, Space, StandardMaterial, TransformNode, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

type TriggerAction = () => void;

export class SceneButton extends TransformNode
{
    btnPlane: Mesh
    btnMat: StandardMaterial

    textPlane: Mesh
    textBlock: TextBlock

    constructor(text: string, scene: Scene, 
        triggerCB: TriggerAction,
        textOptions?: { text?: string, color?: string, outlineColor?: string, outlineWidth?: number, fontFamily?: string, fontSize?: number },
        buttonOptions?:{ emissiveColor?: Color3, width?: number, height?: number},){
        super("PBtn")

        //plane btn background
        this.btnMat = new StandardMaterial("planeBG-material", scene);
        this.btnMat.backFaceCulling = false; // disable backface culling
        this.btnMat.emissiveColor = buttonOptions?.emissiveColor?? new Color3(0.0, 0.0, 0.0);
        
        this.btnPlane = MeshBuilder.CreatePlane("bgPlane:", {
          width: buttonOptions?.width?? 1.5,
          height: buttonOptions?.height?? 1.5,
        });
        this.btnPlane.material = this.btnMat;
        this.btnPlane.setParent(this);
    
        //Text
        this.textPlane = MeshBuilder.CreatePlane("plane:", {
            width: buttonOptions?.width?? 1.5,
            height: buttonOptions?.height?? 1.5,
        });
        var texture = AdvancedDynamicTexture.CreateForMesh(this.textPlane);
        this.textBlock = new TextBlock(text);
        this.textBlock.text = text;
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
    
    }
}