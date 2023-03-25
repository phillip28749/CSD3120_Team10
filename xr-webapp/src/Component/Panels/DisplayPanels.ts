import {
  ActionManager,
  Color3,
  ExecuteCodeAction,
  Mesh,
  MeshBuilder,
  Nullable,
  Scene,
  Space,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "babylonjs";
import { AdvancedDynamicTexture, TextBlock } from "babylonjs-gui";
import { GLOBAL } from "../../Global";
import { TextString } from "../Text/TextString";

export class DisplayPanel extends TransformNode {
  private static idCounter: number = 0;
  panelPlane: Mesh;
  panelMat: StandardMaterial;

  textStrings: TextString[];

  constructor(
    id: string,
    scene: Scene,
    position: Vector3,
    panelOptions?: {
      color?: Color3;
      transparency?: number;
      width?: number;
      height?: number;
    }
  ) {
    super("PPanel");

    //list of texts
    this.textStrings = [];

    //plane background
    this.panelMat = new StandardMaterial("panelMat", scene);
    this.panelMat.backFaceCulling = false; // disable backface culling
    this.panelMat.emissiveColor =
      panelOptions?.color ?? new Color3(0.0, 0.0, 0.0);
    this.panelMat.alpha = panelOptions?.transparency ?? 1.0;

    this.panelPlane = MeshBuilder.CreatePlane("panelPlane:" + id, {
      width: panelOptions?.width ?? 1.5,
      height: panelOptions?.height ?? 1.5,
    });
    this.panelPlane.material = this.panelMat;
    this.panelPlane.setParent(this);

    //Display Panel Properties
    this.position = position;
    this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
  }

  AddNewText(
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
    }
  ) {
    const tempPos = textOptions?.position?? Vector3.Zero();
    textOptions.position = Vector3.Zero();
    const textString = new TextString(
      id + "panelText" + DisplayPanel.idCounter++,
      textOptions
    );

    const restoreDPpos = this.position;
    const restoreDPscale = this.scaling;
    const restoreDProtation = this.rotationQuaternion;

    this.position = Vector3.Zero();
    this.scaling = Vector3.One();
    this.rotation = Vector3.Zero();

    textString.setParent(this);
    textString.position = tempPos;

    this.position = restoreDPpos;
    this.scaling = restoreDPscale;
    this.rotation = restoreDProtation?.toEulerAngles() ?? Vector3.Zero();
    this.rotationQuaternion = restoreDProtation;

    this.textStrings.push(textString);
  }

  EditText(id: string, text: string) {
    for (var i = 0; i < this.textStrings.length; ++i) {
      if (this.textStrings[i].id.search(id) !== -1) {
        this.textStrings[i].textBlock.text = text;
        break;
      }
    }
  }

  ClearText(...excludedIds: string[]) {
    var textStringList : TextString[]
    textStringList = []

    while (this.textStrings.length > 0) {
      const tempText = this.textStrings.pop();

      var searchId = tempText.textPlane.id;
      let tempIndex = tempText.textPlane.id.indexOf("panelText");
      if (tempIndex !== -1) {
        searchId = tempText.textPlane.id.substring(0, tempIndex);
      }
      //GLOBAL.print("searchId " + searchId);

      if (
        excludedIds?.find((id) => {
          return id === searchId;
        }) ??
        false
      ) {
        textStringList.push(tempText);
      } else tempText.dispose();
    }
    
    this.textStrings = [...textStringList];
  }

  DeleteText(id: string) {
    let index = this.textStrings.findIndex((textString) => 
    {
        let tempIndex = textString.textPlane.id.indexOf("panelText");
        if (tempIndex !== -1) {
           if(textString.textPlane.id.substring(0, tempIndex) === id)
           {
            textString.dispose();
            return true
           }
        }
        return false
    })

    if (index !== -1) {
        this.textStrings.splice(index, 1);
    }
  }

  DeleteContainText(text: string) {
    let index = this.textStrings.findIndex((textString) => 
    {
        if(textString.textBlock.text.search(text) !== -1)
        {
            textString.dispose();
            return true
        }
        return false
    })

    if (index !== -1) {
        this.textStrings.splice(index, 1);
    }
  }

  FindText(id: string) : Nullable<TextString>
  {
    let index = this.textStrings.findIndex((textString) => 
    {
        let tempIndex = textString.textPlane.id.indexOf("panelText");
        if (tempIndex !== -1) {
           if(textString.textPlane.id.substring(0, tempIndex) === id)
           {
            return true
           }
        }
        return false
    })

    if (index !== -1) {
        return this.textStrings[index]
    }
    return null
  }
}
