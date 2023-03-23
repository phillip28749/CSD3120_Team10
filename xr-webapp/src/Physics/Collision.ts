import {
  AbstractMesh,
  PointerDragBehavior,
  Vector3,
  WebXRDefaultExperience,
} from "babylonjs";
import { XRScene } from "../Scene/XRScene";
import { GLOBAL } from "../index"

export class Collision {
  static OnPicking(xr: WebXRDefaultExperience, xrScene: XRScene) {
    //setup controller drag
    let mesh: AbstractMesh;
    let p: AbstractMesh;

    const pickingAction = (parentMesh?: AbstractMesh) => {
      // make sure we can only pick reactants
      let m = xrScene.moleculeMg.findReactants(mesh.uniqueId);
      if (m) {
        xrScene.pickedMesh = xrScene.moleculeMg.clone(m); //clone the master mesh
        console.log("picked mesh: " + xrScene.pickedMesh)
        xrScene.pickedMesh.setParent(parentMesh, true); //set under parent controller's mesh
        xrScene.moleculeMg.currSelected = m;
        console.log("currently picked: " + m.name)
      }
    };
    const releaseAction = () => {
      if (mesh && mesh.parent) {
        mesh.setParent(null);
        xrScene.pickedMesh?.setParent(null);
        xrScene.moleculeMg.currSelected = null;
        console.log("release mesh: " + mesh.name);
      }
    };

    if (GLOBAL.DEBUG_MODE) {
      //Mouse Picking
      xrScene.canvas.addEventListener("pointerdown", function (event) {
        // Get the object under the mouse pointer
        var pickResult = xrScene.scene.pick(
          xrScene.scene.pointerX,
          xrScene.scene.pointerY
        );

        // Check if the picked object is the sphere
        if (pickResult.hit) {
          console.log("Picking: " + pickResult.pickedMesh);
          mesh = pickResult.pickedMesh;

          if (mesh.name.indexOf("Molecule") !== -1) {
            pickingAction();
            // need to change picked mesh to the clone mesh
            pickResult.pickedMesh = xrScene.pickedMesh
          }
        } 
      });

      xrScene.canvas.addEventListener("pointerup", function(event) {
        console.log("Mouse button released!");
        releaseAction();
        console.log("destroying this mesh: " + xrScene.pickedMesh)
        xrScene.pickedMesh?.dispose();
        xrScene.pickedMesh = null;
     });
    
    } else {
      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
          const trigger = motionController.getComponentOfType("trigger");
          trigger.onButtonStateChangedObservable.add((state) => {
            if (trigger.changes.pressed) {
              if (xrScene.pickedMesh != null)
                // make sure only one item is selected at a time
                return;

              if (
                (mesh = xr.pointerSelection.getMeshUnderPointer(
                  controller.uniqueId
                ))
              ) {
                console.log("mesh under controllerx pointer: " + mesh.name);
                // only allow picking if its a molecule
                if (mesh.name.indexOf("Molecule") !== -1) {
                  const distance = Vector3.Distance(
                    motionController.rootMesh.getAbsolutePosition(),
                    mesh.getAbsolutePosition()
                  );
                  if (distance < 1) {
                    pickingAction(motionController.rootMesh);
                  }
                }
              } else {
                releaseAction();
              }
            }
          });
        });
      });
    }
  }

  static JoinMolecules(xrScene: XRScene) {
    //reaction zone trigger update
    if (!xrScene.pickedMesh) return;
    if (xrScene.pickedMesh.intersectsMesh(xrScene.reactionZone, false, true)) {
      // reaction trigger logic
      console.log("Meshes intersecting!");
      xrScene.moleculeMg.addReactionToList(xrScene.moleculeMg.currSelected);
      xrScene.moleculeMg.currSelected = null;
      xrScene.pickedMesh.dispose();
      xrScene.pickedMesh = null;
    }
  }

  static BreakMolecules(xrScene: XRScene) {}
}
