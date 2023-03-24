import { ActionManager, Color3, ExecuteCodeAction, Mesh, MeshBuilder, Scene, Space, StandardMaterial, TransformNode, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export class DisplayPanel extends TransformNode
{
    panelPlane: Mesh
    panelMat: StandardMaterial

    textPlane: Mesh
    textBlock: TextBlock

    constructor(id: string, scene: Scene, 
        position: Vector3,
        textOptions?: { text?: string, color?: string, outlineColor?: string, outlineWidth?: number, fontFamily?: string, fontSize?: number },
        panelOptions?:{ color?: Color3, transparency?: number, width?: number, height?: number},){
        super("PPanel")

        //plane btn background
        this.panelMat = new StandardMaterial("panelMat", scene);
        this.panelMat.backFaceCulling = false; // disable backface culling
        this.panelMat.emissiveColor = panelOptions?.color?? new Color3(0.0, 0.0, 0.0);
        this.panelMat.alpha = panelOptions?.transparency?? 1.0;
        
        this.panelPlane = MeshBuilder.CreatePlane("panelPlane:", {
          width: panelOptions?.width?? 1.5,
          height: panelOptions?.height?? 1.5,
        });
        this.panelPlane.material = this.panelMat;
        this.panelPlane.setParent(this);
    
        //Text
        this.textPlane = MeshBuilder.CreatePlane("panelTextPlane:", {
            width: panelOptions?.width?? 1.5,
            height: panelOptions?.height?? 1.5,
        });
        var texture = AdvancedDynamicTexture.CreateForMesh(this.textPlane);
        this.textBlock = new TextBlock(id + "panelText");
        this.textBlock.text = textOptions?.text?? id;
        this.textBlock.color = textOptions?.color?? "white";
        this.textBlock.outlineColor = textOptions?.outlineColor?? "black";
        this.textBlock.outlineWidth = textOptions?.outlineWidth?? 30;
        this.textBlock.fontFamily = textOptions?.fontFamily?? "Bold Arial";
        this.textBlock.fontSize = textOptions?.fontSize?? 300;
        this.textBlock.resizeToFit = true;
        this.textBlock.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        this.textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
        this.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        texture.addControl(this.textBlock);
        this.textPlane.setParent(this);    

        //Display Panel Properties
        this.position = position
        this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
    }
}