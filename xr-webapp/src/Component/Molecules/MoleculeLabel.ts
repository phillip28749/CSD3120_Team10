import { Mesh, MeshBuilder, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export class MoleculeLabel {
    plane: Mesh;
    textBlock: TextBlock;
  
    constructor(
      moleculeName: string,
      position: Vector3,
      textOptions?: { text?: string, color?: string, outlineColor?: string, outlineWidth?: number, fontFamily?: string, fontSize?: number },
      planeOptions?: { width?: number, height?: number },
    ) {
      this.plane = MeshBuilder.CreatePlane("plane:" + moleculeName, {
        width: planeOptions?.width ?? 2,
        height: planeOptions?.height ?? 2,
      });
      this.plane.position = position
      //plane.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
  
      var texture = AdvancedDynamicTexture.CreateForMesh(this.plane);
      this.textBlock = new TextBlock(moleculeName);
      this.textBlock.text = textOptions?.text ?? moleculeName;
      this.textBlock.color = textOptions?.color?? "white";
      this.textBlock.outlineColor = textOptions?.outlineColor?? "black";
      this.textBlock.outlineWidth = textOptions?.outlineWidth?? 30;
      this.textBlock.fontFamily = textOptions?.fontFamily?? "Bold Arial";
      this.textBlock.fontSize = textOptions?.fontSize?? 150;
      this.textBlock.resizeToFit = true;
      this.textBlock.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
      this.textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
      texture.addControl(this.textBlock);
    }
  }