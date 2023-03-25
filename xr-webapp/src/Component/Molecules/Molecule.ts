import { AbstractMesh, PointerDragBehavior, Vector3 } from "babylonjs";
import { MoleculeLabel } from './MoleculeLabel'
import { GLOBAL } from "../../Global";

export class Molecule {
  mesh: AbstractMesh;
  name: string;
  uniqueIds: number[];
  label : MoleculeLabel;

  /**
   * constructor of a molecule obj
   * @param name
   *        chemical symbol of molecule/compound
   */
  constructor(name: string, mesh: AbstractMesh) {
    this.mesh = mesh;
    this.name = name;
    this.uniqueIds = [];

    if(GLOBAL.DEBUG_MODE)
    {
      // var pointerDragBehavior = new PointerDragBehavior({dragPlaneNormal: Vector3.Up()});
      // pointerDragBehavior.useObjectOrientationForDragging = false;
      
      // this.mesh.addBehavior(pointerDragBehavior);
    }
  }
}
