import {
  Color3,
  Engine,
  Mesh,
  MeshBuilder,
  Scene,
  Space,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from "babylonjs";
import { TextString } from "../Text/TextString";

export class Indicator extends TransformNode {
  indPlane: Mesh;
  indMat: StandardMaterial;
  indText: TextString;

  constructor(
    id: string,
    scene: Scene,
    position: Vector3,
    indicatorOptions?: {
      color?: Color3;
      transparency?: number;
      width?: number;
      height?: number;
    },
    textOptions?: {
      position?: Vector3;
      text?: string;
      color?: string;
      outlineColor?: string;
      outlineWidth?: number;
      fontFamily?: string;
      fontSize?: number;
      wordWarp?: boolean;
    }
  ) {
    super("PIndicator");
    //plane background
    this.indMat = new StandardMaterial("indMat", scene);
    this.indMat.diffuseTexture =  new Texture("textures/arrow.png", scene); 
    this.indMat.backFaceCulling = false; // disable backface culling
    // this.indMat.emissiveColor =
    //   indicatorOptions?.color ?? new Color3(0.0, 0.0, 0.0);
    // this.indMat.alpha = indicatorOptions?.transparency ?? 1.0;
    this.indMat.emissiveColor = new Color3(0.2, 0.2, 0.2);
    this.indMat.alphaMode = Engine.ALPHA_COMBINE;
    this.indMat.alpha = 0.5;

    const planeWidth = indicatorOptions?.width ?? 1.5;
    const planeHeight = indicatorOptions?.height ?? 1.5;
    this.indPlane = MeshBuilder.CreatePlane("indPlane:" + id, {
      width: planeWidth,
      height: planeHeight,
    });
    this.indPlane.material = this.indMat;
    this.indPlane.setParent(this);

    this.indText = new TextString(
        id + "indText",
        textOptions
      );

    this.indText.setParent(this)
    this.position = position;
    this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
  }
}
