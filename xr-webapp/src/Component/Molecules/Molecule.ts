import { AbstractMesh } from "babylonjs";
import { MoleculeLabel } from './MoleculeLabel'

export class Molecule {
  root: AbstractMesh;
  name: string;
  uniqueIds: number[];
  label : MoleculeLabel;

  /**
   * constructor of a molecule obj
   * @param name
   *        chemical symbol of molecule/compound
   */
  constructor(name: string, root: AbstractMesh) {
    this.root = root;
    this.name = name;
    this.uniqueIds = [];
  }
}
