/*!*****************************************************************************
\file	SceneButton.ts
/*!*****************************************************************************
\brief
	This file contains the SceneButton class for creating a scene button.
*******************************************************************************/

import {
  ActionManager,
  Color3,
  ExecuteCodeAction,
  Mesh,
  MeshBuilder,
  Space,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "babylonjs";
import { GLOBAL } from "../../Global";
import { XRScene } from "../../Scene/XRScene";
import { TextString } from "../Text/TextString";

type TriggerAction = () => void;

export class SceneButton extends TransformNode {
  btnPlane: Mesh;
  btnMat: StandardMaterial;

  textString: TextString;

  constructor(
    id: string,
    xrScene: XRScene,
    triggerCB: TriggerAction,
    position: Vector3,
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
    buttonOptions?: {
      emissiveColor?: Color3;
      width?: number;
      height?: number;
      borderThickness?: number;
      borderColor?: Color3;
    }
  ) {
    super("PBtn");

    const btnWidth = buttonOptions?.width ?? 1.5;
    const btnHeight = buttonOptions?.height ?? 1.5;

    //plane btn background
    this.btnMat = new StandardMaterial("btnPlaneMat", xrScene.scene);
    this.btnMat.backFaceCulling = false; // disable backface culling
    this.btnMat.emissiveColor =
      buttonOptions?.emissiveColor ?? new Color3(0.0, 0.0, 0.0);

    this.btnPlane = MeshBuilder.CreatePlane("btnPlane:", {
      width: btnWidth,
      height: btnHeight,
    });
    this.btnPlane.material = this.btnMat;
    this.btnPlane.setParent(this);

    //Btn Border
    const borderWidth =
      btnWidth + (buttonOptions?.borderThickness ?? btnWidth / 10);
    const borderHeight =
      btnHeight + (buttonOptions?.borderThickness ?? btnHeight / 10);
    const borderPlane = MeshBuilder.CreatePlane(
      "borderPlane",
      {
        height: borderWidth,
        width: borderHeight,
      },
      xrScene.scene
    );
    borderPlane.position = this.btnPlane.position.clone();
    borderPlane.position.z += 0.001;
    var borderMat = new StandardMaterial("borderMat", xrScene.scene);
    borderMat.diffuseColor = buttonOptions?.borderColor ?? Color3.Gray();
    borderPlane.material = borderMat;
    borderPlane.setParent(this.btnPlane);

    //Text
    this.textString = new TextString(id + "btnText", textOptions);
    this.textString.textPlane.setParent(this);

    // create an action to handle the click event
    const clickDownAction = new ExecuteCodeAction(
      ActionManager.OnPickDownTrigger,
      () => {
        xrScene.locomotion.disableTeleport();
        triggerCB();
      }
    );
    const clickUpAction = new ExecuteCodeAction(
      ActionManager.OnPickUpTrigger,
      () => {
        xrScene.locomotion.enableTeleport();
      }
    );
    // add the click action to the actionManager
    this.btnPlane.actionManager = new ActionManager(xrScene.scene);
    this.btnPlane.actionManager.registerAction(clickDownAction);
    this.btnPlane.actionManager.registerAction(clickUpAction);

    //Scene Button properties
    this.position = position;
    this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
    this.rotate(Vector3.Left(), -Math.PI * 0.5, Space.LOCAL);
    this.scaling = new Vector3(0.1, 0.05, 1);
  }
}
