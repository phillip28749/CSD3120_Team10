/*!*****************************************************************************
\file	TextString.ts
/*!*****************************************************************************
\brief
	This file contains the TextString class for creating a text on the scene.
*******************************************************************************/

import { Mesh, MeshBuilder, TransformNode, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";

export class TextString extends TransformNode {
  textPlane: Mesh;
  textBlock: TextBlock;

  constructor(
    id: string,
    textOptions?: {
      position?: Vector3;
      text?: string;
      color?: string;
      outlineColor?: string;
      outlineWidth?: number;
      fontFamily?: string;
      fontSize?: number;
      wordWarp?: boolean;
    },
    planeOptions?: { width?: number; height?: number }
  ) {
    super("PTextString");

    //Text
    this.textPlane = MeshBuilder.CreatePlane(id + "TextPlane", {
      width: planeOptions?.width ?? 1.5,
      height: planeOptions?.height ?? 1.5,
    });
    var texture = AdvancedDynamicTexture.CreateForMesh(this.textPlane);
    this.textBlock = new TextBlock(id + "Text");
    this.textBlock.text = textOptions?.text ?? id;
    this.textBlock.color = textOptions?.color ?? "white";
    this.textBlock.outlineColor = textOptions?.outlineColor ?? "black";
    this.textBlock.outlineWidth = textOptions?.outlineWidth ?? 10;
    this.textBlock.fontFamily = textOptions?.fontFamily ?? "Bold Arial";
    this.textBlock.fontSize = textOptions?.fontSize ?? 100;
    this.textBlock.resizeToFit = true;
    this.textBlock.textHorizontalAlignment =
      TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
    this.textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_CENTER;
    this.textBlock.textWrapping = textOptions?.wordWarp ?? true;
    texture.addControl(this.textBlock);
    this.textPlane.setParent(this);
    this.textPlane.isPickable = false;

    this.position = textOptions?.position ?? Vector3.Zero();
  }
}
