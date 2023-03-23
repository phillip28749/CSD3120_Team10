import { AbstractMesh, PointerDragBehavior, Vector3 } from "babylonjs";
import { MoleculeLabel } from './MoleculeLabel'
import { GLOBAL } from '../../index'

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
    this.root.checkCollisions = true;
    this.name = name;
    this.uniqueIds = [];

    if(GLOBAL.DEBUG_MODE)
    {
      var pointerDragBehavior = new PointerDragBehavior({dragPlaneNormal: Vector3.Up()});
      pointerDragBehavior.useObjectOrientationForDragging = false;
      
      this.root.addBehavior(pointerDragBehavior);
    }
  }
}
