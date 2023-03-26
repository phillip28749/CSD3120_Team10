import { ActionManager, Color3, ExecuteCodeAction, Mesh, MeshBuilder, Scene, Space, StandardMaterial, TransformNode, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
import { GLOBAL } from "../../Global";
import { TextString } from "../Text/TextString";

type TriggerAction = () => void;

export class SceneButton extends TransformNode
{
    btnPlane: Mesh
    btnMat: StandardMaterial

    textString: TextString

    constructor(id: string, scene: Scene, 
        triggerCB: TriggerAction,
        position: Vector3,
        textOptions?: { position?: Vector3, text?: string, color?: string, outlineColor?: string, 
            outlineWidth?: number, fontFamily?: string, fontSize?: number, wordWarp?: boolean,
        },
        buttonOptions?:{ emissiveColor?: Color3, width?: number, height?: number, borderThickness?: number, borderColor?: Color3},){
        super("PBtn")


        const btnWidth = buttonOptions?.width?? 1.5
        const btnHeight = buttonOptions?.height?? 1.5

        //plane btn background
        this.btnMat = new StandardMaterial("btnPlaneMat", scene);
        this.btnMat.backFaceCulling = false; // disable backface culling
        this.btnMat.emissiveColor = buttonOptions?.emissiveColor?? new Color3(0.0, 0.0, 0.0);
        
        this.btnPlane = MeshBuilder.CreatePlane("btnPlane:", {
          width: btnWidth,
          height: btnHeight,
        });
        this.btnPlane.material = this.btnMat;
        this.btnPlane.setParent(this);
    
        //Btn Border
        const borderWidth = btnWidth + (buttonOptions?.borderThickness?? (btnWidth / 10));
        const borderHeight = btnHeight + (buttonOptions?.borderThickness?? (btnHeight / 10));
        const borderPlane = MeshBuilder.CreatePlane(
          "borderPlane",
          {
            height: borderWidth,
            width: borderHeight,
          },
          scene
        );
        borderPlane.position = this.btnPlane.position.clone();
        borderPlane.position.z += 0.001;
        var borderMat = new StandardMaterial("borderMat", scene);
        borderMat.diffuseColor = buttonOptions?.borderColor ?? Color3.Black();
        borderPlane.material = borderMat;
        borderPlane.setParent( this.btnPlane);

        //Text
        this.textString = new TextString(id + "btnText",textOptions)
        this.textString.textPlane.setParent(this);

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