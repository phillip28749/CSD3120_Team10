/*!*****************************************************************************
\file	DisplayPanel.ts
/*!*****************************************************************************
\brief
	This file contains the DisplayPanel class that include functions for creating 
  the display panel, appending the text onto the display panel and removing 
  text from the display panel
*******************************************************************************/

import {
  Color3,
  Mesh,
  MeshBuilder,
  Nullable,
  ParticleSystem,
  Scene,
  Space,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "babylonjs";
import { GLOBAL } from "../../Global";
import { Molecule } from "../Molecules/Molecule";
import { MoleculeManager } from "../Molecules/MoleculeManager";
import { TextString } from "../Text/TextString";

export class DisplayPanel extends TransformNode {
  private static idCounter: number = 0;
  panelPlane: Mesh;
  panelMat: StandardMaterial;

  textStrings: TextString[];
  moleculeList: Molecule[];

  particleSys: ParticleSystem;

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

    //list of molecules
    this.moleculeList = [];

    //plane background
    this.panelMat = new StandardMaterial("panelMat", scene);
    this.panelMat.backFaceCulling = false; // disable backface culling
    this.panelMat.emissiveColor =
      panelOptions?.color ?? new Color3(0.0, 0.0, 0.0);
    this.panelMat.alpha = panelOptions?.transparency ?? 1.0;

    const planeWidth = panelOptions?.width ?? 1.5;
    const planeHeight = panelOptions?.height ?? 1.5;
    this.panelPlane = MeshBuilder.CreatePlane("panelPlane:" + id, {
      width: planeWidth,
      height: planeHeight,
    });
    this.panelPlane.material = this.panelMat;
    this.panelPlane.setParent(this);
    this.panelPlane.isPickable = false;

    //Display Panel Properties
    this.position = position;
    this.rotate(Vector3.Up(), Math.PI * 0.5, Space.LOCAL);
  }

  /**
   *  Add a new text string to the display panel
   *
   * @param  id
   *         The id of the new text to be added
   *
   * @param  textOptions
   *         The text options for the new text
   *
   * @returns none
   */
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
    const tempPos = textOptions?.position ?? Vector3.Zero();
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

  /**
   *  Edit an existing string of texts on the display panel
   *
   * @param  id
   *         The id of the text to be edited
   *
   * @param  text
   *         The string of texts to be changed to
   *
   * @returns none
   */
  EditText(id: string, text: string) {
    for (var i = 0; i < this.textStrings.length; ++i) {
      if (this.textStrings[i].id.search(id) !== -1) {
        this.textStrings[i].textBlock.text = text;
        break;
      }
    }
  }

  /**
   *  Clears all the text on the display panel, but exclude the list of ids provided
   *
   * @param  excludedIds
   *         The list of ids to be excluded from clearing
   *
   * @returns none
   */
  ClearText(...excludedIds: string[]) {
    var textStringList: TextString[];
    textStringList = [];

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

  /**
   *  Delete a text on the display panel
   *
   * @param  id
   *         The id to be deleted from the display panel
   *
   * @returns none
   */
  DeleteText(id: string) {
    let index = this.textStrings.findIndex((textString) => {
      let tempIndex = textString.textPlane.id.indexOf("panelText");
      if (tempIndex !== -1) {
        if (textString.textPlane.id.substring(0, tempIndex) === id) {
          textString.dispose();
          return true;
        }
      }
      return false;
    });

    if (index !== -1) {
      this.textStrings.splice(index, 1);
    }
  }

  /**
   *  Delete a text on the display panel that contains a certain word
   *
   * @param  word
   *         The word to be searched for when deleting the text
   *
   * @returns none
   */
  DeleteContainText(word: string) {
    let index = this.textStrings.findIndex((textString) => {
      if (textString.textBlock.text.search(word) !== -1) {
        textString.dispose();
        return true;
      }
      return false;
    });

    if (index !== -1) {
      this.textStrings.splice(index, 1);
    }
  }

  /**
   *  Find a text on the display panel
   *
   * @param  id
   *         The id to be searched for in the display panel
   *
   * @returns the text found
   */
  FindText(id: string): Nullable<TextString> {
    let index = this.textStrings.findIndex((textString) => {
      let tempIndex = textString.textPlane.id.indexOf("panelText");
      if (tempIndex !== -1) {
        if (textString.textPlane.id.substring(0, tempIndex) === id) {
          return true;
        }
      }
      return false;
    });

    if (index !== -1) {
      return this.textStrings[index];
    }
    return null;
  }

  /**
   *  Adds a molecule to the display panel
   *
   * @param  name
   *         The name of the molecule to search for and add to the display panel
   *
   * @param  moleculeMg
   *         The molecule manager to find the molecule and clone it
   *
   * @param  position
   *         The position to place the clone molecule on the display panel
   *
   * @returns the newly cloned molecule
   */
  AddNewMolecule(
    name: string,
    moleculeMg: MoleculeManager,
    position?: Vector3
  ): Nullable<Molecule> {
    for (const m of moleculeMg.getAllMolecules()) {
      if (name === m.label.textBlock.text) {
        const cloneMol = moleculeMg.cloneMolecule(m);

        const restoreDPpos = this.position;
        const restoreDPscale = this.scaling;
        const restoreDProtation = this.rotationQuaternion;

        this.position = Vector3.Zero();
        this.scaling = Vector3.One();
        this.rotation = Vector3.Zero();

        cloneMol.mesh.setParent(this);
        cloneMol.mesh.position = position ?? Vector3.Zero();
        cloneMol.mesh.scaling.setAll(0.3);
        cloneMol.mesh.rotate(Vector3.Down(), Math.PI * 0.5, Space.LOCAL);
        cloneMol.mesh.rotate(Vector3.Backward(), Math.PI * 0.5, Space.LOCAL);

        this.position = restoreDPpos;
        this.scaling = restoreDPscale;
        this.rotation = restoreDProtation?.toEulerAngles() ?? Vector3.Zero();
        this.rotationQuaternion = restoreDProtation;

        this.moleculeList.push(cloneMol);
        return cloneMol;
      }
    }
    return null;
  }

  /**
   *  Clears all the molecules on the display panel
   *
   * @returns none
   */
  ClearMolecules() {
    while (this.moleculeList.length > 0) {
      const tempMol = this.moleculeList.pop();
      tempMol.mesh.dispose();
    }
  }
}
