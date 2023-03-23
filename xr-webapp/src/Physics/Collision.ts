import { AbstractMesh, Vector3, WebXRDefaultExperience } from "babylonjs";
import { XRScene } from "../Scene/XRScene";

export class Collision {
  static OnPicking(xr: WebXRDefaultExperience, xrScene: XRScene) {
    //setup controller drag
    let mesh: AbstractMesh;
    let p: AbstractMesh;

    xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((motionController) => {
        const trigger = motionController.getComponentOfType("trigger");
        trigger.onButtonStateChangedObservable.add((state) => {
          if (trigger.changes.pressed) {
            if (xrScene.xrPointerMesh != null)
              // make sure only one item is selected at a time
              return;

            if (
              (mesh = xr.pointerSelection.getMeshUnderPointer(
                controller.uniqueId
              ))
            ) {
              //console.log("mesh under controller pointer: " + mesh.name);
              // only allow picking if its a molecule
              if (mesh.name.indexOf("Molecule") !== -1) {
                const distance = Vector3.Distance(
                  motionController.rootMesh.getAbsolutePosition(),
                  mesh.getAbsolutePosition()
                );
                if (distance < 1) {
                  // make sure we can only pick reactants
                  let m = xrScene.moleculeMg.findReactants(mesh.uniqueId);
                  if (m) {
                    xrScene.xrPointerMesh = xrScene.moleculeMg.clone(m); //clone the master mesh
                    xrScene.xrPointerMesh.setParent(
                      motionController.rootMesh,
                      true
                    ); //set under parent controller's mesh
                    xrScene.moleculeMg.currSelected = m;
                  }
                }
              }
            } else {
              if (mesh && mesh.parent) {
                mesh.setParent(null);
                xrScene.xrPointerMesh.setParent(null);
                //console.log("release mesh: " + mesh.name);
              }
            }
          }
        });
      });
    });
  }

  static JoinMolecules(xrScene: XRScene) {
    //reaction zone trigger update
    if (!xrScene.xrPointerMesh) return;
    if (
      xrScene.xrPointerMesh.intersectsMesh(xrScene.reactionZone, false, true)
    ) {
      // reaction trigger logic
      //console.log("Meshes intersecting!");
      xrScene.moleculeMg.addReactionToList(xrScene.moleculeMg.currSelected);
      xrScene.moleculeMg.currSelected = null;
      xrScene.xrPointerMesh.dispose();
      xrScene.xrPointerMesh = null;
    }
  }

  static BreakMolecules(xrScene: XRScene) {}
}
