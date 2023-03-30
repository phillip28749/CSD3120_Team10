import {
  Color3,
  Color4,
  Engine,
  Mesh,
  MeshBuilder,
  Scene,
  Space,
  StandardMaterial,
  Texture,
  TransformNode,
  Animation,
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

    //Arrow texture
    this.indMat = new StandardMaterial("indMat", scene);
    this.indMat.diffuseTexture = new Texture("textures/arrow.png", scene);
    this.indMat.diffuseTexture.hasAlpha = true;
    this.indMat.backFaceCulling = false; // disable backface culling
    this.indMat.alpha = indicatorOptions?.transparency ?? 1.0;
    this.indMat.emissiveColor =
      indicatorOptions?.color ?? new Color3(0.0, 0.0, 0.0);

    //Arrow plane
    const planeWidth = indicatorOptions?.width ?? 1.5;
    const planeHeight = indicatorOptions?.height ?? 1.5;
    this.indPlane = MeshBuilder.CreatePlane("indPlane:" + id, {
      width: planeWidth,
      height: planeHeight,
    });
    this.indPlane.material = this.indMat;

    this.indPlane.scaling.y = 0.08;
    this.indPlane.scaling.x = this.indPlane.scaling.y - 0.02;
    this.indPlane.setParent(this);
    this.indPlane.isPickable = false;

    //Arrow Animation 
    const animationOffset = 0.03
    var arrowAnimation = new Animation(
      "arrowAnimation",
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const arrowIniPos = this.indPlane.position.y
    var arrowKF = [];
    arrowKF.push({
      frame: 0,
      value: arrowIniPos,
    });
    arrowKF.push({
      frame: 15,
      value: arrowIniPos + animationOffset,
    });
    arrowKF.push({
      frame: 30,
      value: arrowIniPos,
    });
    arrowKF.push({
      frame: 45,
      value: arrowIniPos - animationOffset,
    });
    arrowKF.push({
      frame: 60,
      value: arrowIniPos,
    });
    arrowAnimation.setKeys(arrowKF);
    this.indPlane.animations.push(arrowAnimation);
    scene.beginAnimation(this.indPlane, 0, 60, true);

    //Text
    textOptions.fontSize = 50
    this.indText = new TextString(id + "indText", textOptions);
    this.indText.scaling.setAll(0.7);
    this.indText.position.y = 0.2;
    this.indText.setParent(this);

    //Text Animation 
    var textAnimation = new Animation(
      "textAnimation",
      "position.y",
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const textIniPos = this.indText.position.y
    var textKF = [];
    textKF.push({
      frame: 0,
      value: textIniPos,
    });
    textKF.push({
      frame: 15,
      value: textIniPos - animationOffset,
    });
    textKF.push({
      frame: 30,
      value: textIniPos,
    });
    textKF.push({
      frame: 45,
      value: textIniPos + animationOffset,
    });
    textKF.push({
      frame: 60,
      value: textIniPos,
    });
    textAnimation.setKeys(textKF);
    this.indText.animations.push(textAnimation);
    scene.beginAnimation(this.indText, 0, 60, true);
    
    //Position the Indicator
    this.position = position;
    this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
    this.Hide();
  }

  Show()
  {
    this.setEnabled(true)
  
  }

  Hide()
  {
    this.setEnabled(false)
  }
}
