import { AbstractMesh, Nullable, Vector3 } from "babylonjs";
import { GLOBAL } from "../../Global";
import { XRScene } from "../../Scene/XRScene";
import { Molecule } from "./Molecule";

/**
 * A manager class for molecules to perform molecule logic and holds data relating to molecules
 */
export class MoleculeManager {
  private xrScene: XRScene;

  currSelected: Nullable<Molecule>; // currently selected molecule
  private reactants: Molecule[]; // the available reactants
  private reactions: Molecule[]; // the available results for reactions
  private moleculeList: Molecule[]; 

  private joinReactantList: Map<string, number>; // list molecule and its count in the reaction list
  private breakReactantList: Map<string, number>; 
  private breakReaction: Molecule

  /**
   * Default constructs a molecule manager
   */
  constructor(xrScene: XRScene) {
    this.xrScene = xrScene;

    this.currSelected = null;
    this.reactants = [];
    this.reactions = [];

    this.joinReactantList = new Map<string, number>();
    this.breakReactantList = new Map<string, number>();

    this.breakReaction = null
  }

  getAllReactants(): Molecule[] {
    return this.reactants;
  }

  getAllReactions(): Molecule[] {
    return this.reactions;
  }

  getAllMolecules(): Molecule[] {
    return this.moleculeList;
  }

  /**
   * Adds a molecule to the reaction list used to check for reaction
   * @param  m
   *         The reactant molecule obj
   */
  private static joinCounter: number = 0;
  addJoinReactantToList(m: Nullable<Molecule>) {
    const numRows = 3;
    const numCols = 3;
    const numMol = numRows * numCols;

    if (MoleculeManager.joinCounter >= numMol) {
      if (this.xrScene.joinPanel.FindText("noMoreAdding") === null)
        this.xrScene.joinPanel.AddNewText("noMoreAdding", {
          text: "MAX MOLECULES REACHED!",
          fontSize: 70,
          outlineWidth: 7,
          position: new Vector3(0, -0.5, 0),
          color: "red",
        });
      return;
    }

    var count = this.joinReactantList.get(m.name);
    if (count !== undefined) {
      ++count;
      GLOBAL.print("Add reaction name:" + m.name);
      this.joinReactantList.set(m.name, count);

      //Add to display panel
      const rowNo = MoleculeManager.joinCounter % numRows;
      const colNo = Math.floor(MoleculeManager.joinCounter / numRows);

      MoleculeManager.joinCounter++;

      const textPos = new Vector3(-0.4 + colNo * 0.4, 0.3 + rowNo * -0.3, 0);
      this.xrScene.joinPanel.AddNewText(m.name + count, {
        text: m.name,
        fontSize: 90,
        outlineWidth: 9,
        position: textPos,
        color: "grey",
      });
    } else GLOBAL.print("Error: adding reaction to list");
  }

  addBreakReaction(m: Nullable<Molecule>) {
    GLOBAL.print("Add reaction name:" + m.name);
    this.breakReaction = m
  }
  /**
   * Clears the reaction list and reset it
   */
  clearJoinReactionList() {
    this.reactants.forEach((m) => {
      this.joinReactantList.set(m.name, 0);
    });
    this.xrScene.joinPanel.ClearText("joinHeader");
    MoleculeManager.joinCounter = 0;
    GLOBAL.print("clear reaction list");
  }

  clearBreakReaction() {
    this.breakReaction = null
  }


  /**
   * Push a molecule to the list of available reactants
   * @param   m
   *          The reactant molecule obj
   */
  pushReactants(m: Molecule) {
    this.reactants.push(m);
    this.moleculeList.push(m)
    this.joinReactantList.set(m.name, 0);
    this.breakReactantList.set(m.name, 0)
  }

  /**
   * Push a molecule to the list of available result from reaction
   * @param   m
   *          The reactant molecule obj
   */
  pushReactions(m: Molecule) {
    this.reactions.push(m);
    this.moleculeList.push(m)
  }

  /**
   * Finds a reactant master mesh's root by using its own/children's unique mesh id.
   * @param   id
   *          The unique id of mesh to perform search
   * @returns
   *          The master molecule object in the reactant list
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
   * Gets the result from the reaction
   * @returns
   *          The resulting molecule object from the reaction,
   *          null is return if the process fails.
   */
  getJoinResult(): Nullable<Molecule> {
    var m: Nullable<Molecule> = null;
    const cc = this.joinReactantList.get("C");
    const o2c = this.joinReactantList.get("O2");
    const h2c = this.joinReactantList.get("H2");
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
    )
      m = this.reactions[0];
    //C6H6
    else if (
      cc !== undefined &&
      cc == 6 &&
      h2c !== undefined &&
      h2c == 3 &&
      (o2c === undefined || o2c === 0)
    )
      m = this.reactions[1];

    //reaction success clear the reaction list
    if (m != null) this.clearJoinReactionList();

    return m;
  }

  getBreakResult(): Molecule[] {
    const isAlphabet = (char: string): boolean => /[a-zA-Z]/.test(char);

    var result : Molecule[] = []
    if(this.breakReaction !== null)
    {//Finding out which molecule/atom to break up into
      const labelText = this.breakReaction.label.textBlock.text

      //e.g. CO2
      for (let i = 0; i < labelText.length-1;) 
      {
        if(isAlphabet(labelText[i]))
        {//e.g. CO2 -> C
          if(isAlphabet(labelText[i+1]))
          {//e.g. CO2 -> CO (O is an alphabet)
            //This situation will only happen for "C"
            this.breakReactantList.set(labelText[i], 0)
          }
          else
          {//e.g. C6H6 -> C6 (6 is a number)
            if(labelText[i] === "C")
            {
              this.breakReactantList.set(labelText[i], parseInt(labelText[i+1]))
            }
            else
            {//For O2 and H2
              this.breakReactantList.set(labelText[i] + "2", parseInt(labelText[i+1])/2)
            }
          }
        }
      }

      const cc = this.breakReactantList.get("C");
      const o2c = this.breakReactantList.get("O2");
      const h2c = this.breakReactantList.get("H2");

      this.reactants.forEach((m) => {
        var size : number = 0;

        switch(m.name)
        {
          case "C":
          {
            size = cc
            break;
          }
          case "O2":
          {
            size = o2c
            break
          }
          case "H2":
          {
            size = h2c
            break
          }
        }

        for(var i = 0; i < size; ++i)
        {
          result.push(m)
        }
      });

      //Clearing the list
      this.reactants.forEach((m) => {
        this.breakReactantList.set(m.name, 0);
      });

    }
    
    return result;
  }

  /**
   * Clones the given molecule's meshs,material and transform
   * @param   m
   *          The molecule to clone
   * @returns
   *          The cloned molecule's mesh
   */
  clone(m: Molecule): Nullable<AbstractMesh> {
    return m.mesh.clone(m.mesh.name + "_clone", null);
  }
}
