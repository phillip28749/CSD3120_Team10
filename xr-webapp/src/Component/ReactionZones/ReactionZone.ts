/*!*****************************************************************************
\file	ReactionZone.ts
/*!*****************************************************************************
\brief
	This file contains the ReactionZone class for creating a reaction zone on 
    the scene.
*******************************************************************************/

import {
  AbstractMesh,
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "babylonjs";
import { ParticleEvent } from "../../Events";
import { XRScene } from "../../Scene/XRScene";

export class ReactionZone extends TransformNode {
  mesh: AbstractMesh;
  mat: StandardMaterial;
  particleEvent: ParticleEvent;

  constructor(
    name: string,
    position: Vector3,
    xrScene: XRScene,
    zoneOptions?: { color?: Color3; transparency?: number; diameter?: number }
  ) {
    super("PReactionZone");

    this.mat = new StandardMaterial("reactionMat");
    this.mat.emissiveColor = zoneOptions.color ?? new Color3(0.0, 0.0, 0.0);
    this.mat.alpha = zoneOptions.transparency ?? 1.0;

    this.mesh = MeshBuilder.CreateSphere(name + "reactionSphere", {
      diameter: zoneOptions.diameter ?? 1.0,
    });
    this.mesh.position = position;
    this.mesh.material = this.mat;
    this.mesh.isPickable = false;
    this.mesh.checkCollisions = true;
    this.mesh.setParent(this);

    this.particleEvent = new ParticleEvent();
    this.particleEvent.init(xrScene.scene, this.mesh);
    this.particleEvent.setDuration(300);
  }
}
