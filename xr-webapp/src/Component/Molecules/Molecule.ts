/*!*****************************************************************************
\file	Molecule.ts
/*!*****************************************************************************
\brief
	This file contains the Molecule class for creating a molecule.
*******************************************************************************/

import { AbstractMesh } from "babylonjs";
import { MoleculeLabel } from "./MoleculeLabel";
import { GLOBAL } from "../../Global";

export class Molecule {
  mesh: AbstractMesh;
  name: string;
  uniqueIds: number[];
  label: MoleculeLabel;

  constructor(name: string, mesh: AbstractMesh) {
    this.mesh = mesh;
    this.name = name;
    this.uniqueIds = [];
  }
}
