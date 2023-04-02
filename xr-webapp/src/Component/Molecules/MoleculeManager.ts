/*!*****************************************************************************
\file	MoleculeManager.ts
/*!*****************************************************************************
\brief
	This file contains the MoleculeManager class for managing the molecules in 
  the scene.
*******************************************************************************/

import { AbstractMesh, Nullable, Vector3 } from "babylonjs";
import { GLOBAL } from "../../Global";
import { XRScene } from "../../Scene/XRScene";
import { Molecule } from "./Molecule";

export enum MoleculeInZone {
  Reactant,
  Reaction,
  None,
}

/**
 * A manager class for molecules to perform molecule logic and holds data relating to molecules
 */
export class MoleculeManager {
  private xrScene: XRScene;

  currSelected: Nullable<Molecule>; // currently selected molecule
  private reactants: Molecule[]; // the available reactants
  private reactions: Molecule[]; // the available results for reactions
  private moleculeList: Molecule[];

  molInZone: MoleculeInZone;
  private reactList: Map<string, number>; // list molecule and its count in the reaction list

  /**
   * Default constructs a molecule manager
   */
  constructor(xrScene: XRScene) {
    this.xrScene = xrScene;

    this.currSelected = null;
    this.reactants = [];
    this.reactions = [];
    this.moleculeList = [];

    this.molInZone = MoleculeInZone.None;
    this.reactList = new Map<string, number>();
  }

  /**
   *  Gets all the reactant molecules in the reactant list
   *
   * @returns the list of reactant molecules
   */
  getAllReactants(): Molecule[] {
    return this.reactants;
  }

  /**
   *  Gets all the reaction molecules in the reactions list
   *
   * @returns the list of reaction molecules
   */
  getAllReactions(): Molecule[] {
    return this.reactions;
  }

  /**
   *  Gets all the molecules in the molecule list
   *
   * @returns the list of molecules
   */
  getAllMolecules(): Molecule[] {
    return this.moleculeList;
  }

  private static molCounter: number = 0;
  /**
   *  Adds a molecule to the react list
   *
   * @param  m
   *         The molecule object to be added
   *
   * @returns none
   */
  addMoleculeToList(m: Nullable<Molecule>) {
    //Check the type of molecule added to the zone
    var addingMol = MoleculeInZone.None;
    for (let i = 0; i < this.reactants.length; ++i) {
      if (this.reactants[i].label.textBlock.text === m.name) {
        addingMol = MoleculeInZone.Reactant;
        break;
      }
    }
    if (addingMol === MoleculeInZone.None) {
      for (let i = 0; i < this.reactants.length; ++i) {
        if (this.reactions[i].label.textBlock.text === m.name) {
          addingMol = MoleculeInZone.Reaction;
          break;
        }
      }
    }
    if (addingMol === MoleculeInZone.None) return;

    //Reset React list
    if (addingMol !== this.molInZone) {
      this.ResetReactList();
      this.molInZone = addingMol;
    }

    var count = this.reactList.get(m.name);
    if (count !== undefined) {
      ++count;

      if (addingMol === MoleculeInZone.Reactant) {
        //Adding reactant to list
        const numRows = 3;
        const numCols = 3;
        const numMol = numRows * numCols;

        //Check to see if molecules added exceed the limit allowed on display panel
        if (MoleculeManager.molCounter >= numMol) {
          if (this.xrScene.reactionPanel.FindText("noMoreAdding") === null)
            this.xrScene.reactionPanel.AddNewText("noMoreAdding", {
              text: "MAX MOLECULES REACHED!",
              fontSize: 70,
              outlineWidth: 7,
              position: new Vector3(0, -0.5, 0),
              color: "red",
            });
          return;
        }

        GLOBAL.print("Add reactant name:" + m.name);
        this.reactList.set(m.name, count);

        //Add to display panel
        const rowNo = MoleculeManager.molCounter % numRows;
        const colNo = Math.floor(MoleculeManager.molCounter / numRows);
        MoleculeManager.molCounter++;

        const textPos = new Vector3(-0.4 + colNo * 0.4, 0.3 + rowNo * -0.3, 0);
        this.xrScene.reactionPanel.AddNewText(m.name + count, {
          text: m.name,
          fontSize: 90,
          outlineWidth: 9,
          position: textPos,
          color: "grey",
        });
      } else {
        //Adding reaction to list
        //Can only have 1 reaction in the list
        this.ResetReactList();
        this.molInZone = MoleculeInZone.Reaction;

        GLOBAL.print("Add reaction name:" + m.name);
        this.reactList.set(m.name, count);
        //Add to display panel
        this.xrScene.reactionPanel.AddNewText(m.name + count, {
          text: m.name,
          fontSize: 90,
          outlineWidth: 9,
          position: Vector3.Zero(),
          color: "grey",
        });
      }
    } else GLOBAL.print("Error: adding molecule to react list");
  }

  /**
   * Clears the react list and reset the reaction panel
   *
   * @returns none
   */
  ResetReactList() {
    this.ClearReactList();
    this.xrScene.reactionPanel.ClearText("reactionHeader");
    this.xrScene.reactionPanel.ClearMolecules();
  }

  /**
   * Clears the reaction list
   *
   * @returns none
   */
  ClearReactList() {
    this.moleculeList.forEach((m) => {
      this.reactList.set(m.name, 0);
    });
    MoleculeManager.molCounter = 0;
    this.molInZone = MoleculeInZone.None;
    GLOBAL.print("clear reaction list");
  }

  /**
   * Push a molecule to the reactant and molecule lists
   * @param   m
   *          The reactant molecule obj
   *
   * @returns none
   */
  pushReactants(m: Molecule) {
    this.reactants.push(m);
    this.moleculeList.push(m);
    this.reactList.set(m.name, 0);
  }

  /**
   * Push a molecule to the reaction and molecule lists
   *
   * @param   m
   *          The reaction molecule object
   *
   * @returns none
   */
  pushReactions(m: Molecule) {
    this.reactions.push(m);
    this.moleculeList.push(m);
    this.reactList.set(m.name, 0);
  }

  /**
   * Finds a reactant master mesh root by using its own/children's unique mesh id.
   *
   * @param   id
   *          The unique id of mesh to perform search
   *
   * @returns The master molecule object in the molecule list
   */
  findMolecule(id: number): Nullable<Molecule> {
    for (let m of this.moleculeList) {
      //GLOBAL.print("finding id:" + id.toString());

      if (m.uniqueIds.indexOf(id) !== -1) {
        return m;
      }
    }
    return null;
  }

  /**
   * Get the result of the joined molecules
   *
   * @returns The resulting molecule object from the reaction
   */
  getJoinResult(): Nullable<Molecule> {
    var m: Nullable<Molecule> = null;
    const cc = this.reactList.get("C");
    const o2c = this.reactList.get("O2");
    const h2c = this.reactList.get("H2");
    // if(cc !== undefined)
    //     GLOBAL.print("C:" + cc.toString());
    // if(o2c !== undefined)
    //     GLOBAL.print("O2:" + o2c.toString());
    // if(h2c !== undefined)
    //     GLOBAL.print("H2:" + h2c.toString());

    //CO2
    if (
      cc !== undefined &&
      cc == 1 &&
      o2c !== undefined &&
      o2c == 1 &&
      (h2c === undefined || h2c === 0)
    ) {
      for (let i = 0; i < this.reactions.length; ++i) {
        if (this.reactions[i].label.textBlock.text === "CO2") {
          m = this.reactions[i];
          break;
        }
      }
    }
    //C6H6
    else if (
      cc !== undefined &&
      cc == 6 &&
      h2c !== undefined &&
      h2c == 3 &&
      (o2c === undefined || o2c === 0)
    )
      for (let i = 0; i < this.reactions.length; ++i) {
        if (this.reactions[i].label.textBlock.text === "C6H6") {
          m = this.reactions[i];
          break;
        }
      }

    //reaction success clear the reaction list
    if (m != null) this.ResetReactList();

    return m;
  }

  /**
   * Get the result of the broken molecules
   *
   * @returns The broken molecules in an array
   */
  getBreakResult(): Molecule[] {
    const isAlphabet = (char: string): boolean => /[a-zA-Z]/.test(char);

    var labelText: Nullable<string> = null;
    if (this.reactList.get("CO2")) {
      labelText = "CO2";
    } else {
      labelText = "C6H6";
    }

    var result: Molecule[] = [];
    if (labelText !== null) {
      //Finding out which molecule/atom to break up into
      var breakReactionList = new Map<string, number>();
      //e.g. CO2
      for (let i = 0; i < labelText.length - 1; ) {
        if (isAlphabet(labelText[i])) {
          //e.g. CO2 -> C
          if (isAlphabet(labelText[i + 1])) {
            //e.g. CO2 -> CO (O is an alphabet)
            //This situation will only happen for "C"
            breakReactionList.set(labelText[i], 1);
            i++;
          } else {
            //e.g. C6H6 -> C6 (6 is a number)
            if (labelText[i] === "C") {
              breakReactionList.set(labelText[i], parseInt(labelText[i + 1]));
            } else {
              //For O2 and H2
              breakReactionList.set(
                labelText[i] + "2",
                parseInt(labelText[i + 1]) / 2
              );
            }
            i += 2;
          }
        }
      }

      const cc = breakReactionList.get("C");
      const o2c = breakReactionList.get("O2");
      const h2c = breakReactionList.get("H2");

      GLOBAL.print("cc " + cc);
      GLOBAL.print("o2c " + o2c);
      GLOBAL.print("h2c " + h2c);
      this.reactants.forEach((m) => {
        var size: number = 0;

        switch (m.name) {
          case "C": {
            size = cc;
            break;
          }
          case "O2": {
            size = o2c;
            break;
          }
          case "H2": {
            size = h2c;
            break;
          }
        }

        for (var i = 0; i < size; ++i) {
          result.push(m);
        }
      });
    }

    return result;
  }

  /**
   * Clones the given molecule meshs, material and transform
   *
   * @param   m
   *          The molecule to clone
   *
   * @returns The cloned molecule mesh
   */
  cloneMesh(m: Molecule): Nullable<AbstractMesh> {
    let clonedMesh = m.mesh.clone(m.mesh.name + "_clone", null);
    clonedMesh.isPickable = false;
    return clonedMesh;
  }

  /**
   * Clones the given molecule
   *
   * @param   m
   *          The molecule to clone
   *
   * @returns The cloned molecule
   */
  cloneMolecule(m: Molecule): Nullable<Molecule> {
    let clonedMol = new Molecule(
      m.name + "_clone",
      m.mesh.clone(m.mesh.name + "_clone", null)
    );
    clonedMol.mesh.isPickable = false;
    return clonedMol;
  }
}
