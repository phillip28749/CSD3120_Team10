import { ActionManager, Color3, ExecuteCodeAction, Mesh, MeshBuilder, Scene, Space, StandardMaterial, TransformNode, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
import { TextString } from "../Text/TextString";

export class DisplayPanel extends TransformNode
{
    private static idCounter: number = 0
    panelPlane: Mesh
    panelMat: StandardMaterial

    textStrings : TextString[]

    constructor(id: string, scene: Scene, 
        position: Vector3,
        panelOptions?:{ color?: Color3, transparency?: number, width?: number, height?: number},){
        super("PPanel")

        //list of texts
        this.textStrings = [];

        //plane background
        this.panelMat = new StandardMaterial("panelMat", scene);
        this.panelMat.backFaceCulling = false; // disable backface culling
        this.panelMat.emissiveColor = panelOptions?.color?? new Color3(0.0, 0.0, 0.0);
        this.panelMat.alpha = panelOptions?.transparency?? 1.0;
        
        this.panelPlane = MeshBuilder.CreatePlane("panelPlane:" + id, {
          width: panelOptions?.width?? 1.5,
          height: panelOptions?.height?? 1.5,
        });
        this.panelPlane.material = this.panelMat;
        this.panelPlane.setParent(this);

        //Display Panel Properties
        this.position = position
        this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
    }

    AddNewTextSentence(id: string, textOptions?: { position?: Vector3, text?: string, color?: string, outlineColor?: string, 
        outlineWidth?: number, fontFamily?: string, fontSize?: number, wordWarp?: boolean,
    },)
    {
        const textString = new TextString(id + "panelText" + DisplayPanel.idCounter++, textOptions)
        textString.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
        textString.scaling = this.scaling
        textString.textPlane.setParent(this);
        this.textStrings.push(textString)
    }

    EditText(id : string, text: string)
    {
        for(var i = 0; i < this.textStrings.length; ++i)
        {
            if(this.textStrings[i].id.search(id) !== -1 )
            {
                this.textStrings[i].textBlock.text = text
                break;
            }
        }
    }
}