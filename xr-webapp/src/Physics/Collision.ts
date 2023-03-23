import {
  AbstractMesh,
  Vector3,
  WebXRDefaultExperience,
} from "babylonjs";
import { XRScene } from "../Scene/XRScene";
import { GLOBAL } from "../index";

export class Collision {
  static OnPicking(xr: WebXRDefaultExperience, xrScene: XRScene) {
    //setup controller drag
    //let p: AbstractMesh; //dk what is this...

    const pickingAction = (pickedMesh: AbstractMesh, parentMesh: AbstractMesh) => {
      // make sure we can only pick reactants
      let m = xrScene.moleculeMg.findReactants(pickedMesh.uniqueId);
      if (m) {
        xrScene.pickedMesh = xrScene.moleculeMg.clone(m); //clone the master mesh
        xrScene.pickedMesh.setParent(parentMesh, true); //set under parent controller's mesh
        console.log("picked mesh: " + xrScene.pickedMesh);
        xrScene.moleculeMg.currSelected = m;
        console.log("currently picked: " + m.name);
      }
    };
    const releaseAction = () => {
        xrScene.pickedMesh?.setParent(null);
        console.log("destroying this mesh: " + xrScene.pickedMesh);
        xrScene.pickedMesh?.dispose();
        xrScene.pickedMesh = null;
        xrScene.moleculeMg.currSelected = null;
    };

    if (GLOBAL.DEBUG_MODE) {
      var parentMesh = new AbstractMesh("MousePicking");
      //Mouse Picking
      xrScene.canvas.addEventListener("pointermove", function (event) {
        var pickResult = xrScene.scene.pick(
          xrScene.scene.pointerX,
          xrScene.scene.pointerY
        );
        if(pickResult !== null && pickResult.pickedPoint !== null)
        {
          parentMesh.position.x = pickResult.pickedPoint.x;
          parentMesh.position.y = pickResult.pickedPoint.y;
          parentMesh.position.z = pickResult.pickedPoint.z;
        }
      });

      xrScene.canvas.addEventListener("pointerdown", function (event) {
        // Get the object under the mouse pointer
        var pickResult = xrScene.scene.pick(
          xrScene.scene.pointerX,
          xrScene.scene.pointerY
        );

        //Grab mesh
        if (pickResult.hit) {
          console.log("Picking: " + pickResult.pickedMesh.parent);
          if (pickResult.pickedMesh.name.indexOf("Molecule") !== -1) {
            //Disabling Camera
            xrScene.sceneCam.camera.detachControl()
            pickingAction(pickResult.pickedMesh, parentMesh);
          }
        }
      });

      xrScene.canvas.addEventListener("pointerup", function (event) {
        //Enabling Camera
        xrScene.sceneCam.camera.attachControl()

        //Ungrab mesh
        console.log("Mouse button released!");
        releaseAction();
      });
    } else {
      let mesh: AbstractMesh;
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
                console.log("mesh under controllerx pointer: " + mesh);
                // only allow picking if its a molecule
                if (mesh.name.indexOf("Molecule") !== -1) {
                  const distance = Vector3.Distance(
                    motionController.rootMesh.getAbsolutePosition(),
                    mesh.getAbsolutePosition()
                  );
                  if (distance < 1) {
                    console.log(
                      "motionController.rootMesh " + motionController.rootMesh
                    );
                    pickingAction(mesh, motionController.rootMesh);
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
