import { AbstractMesh, Vector3, WebXRDefaultExperience, WebXRFeatureName } from "babylonjs";
import { XRScene } from "../Scene/XRScene";
import { GLOBAL } from "../Global";

export class Collision {
  static OnPicking(xr: WebXRDefaultExperience, xrScene: XRScene) {
    const pickingAction = (
      pickedMesh: AbstractMesh,
      parentMesh: AbstractMesh
    ) => {
      // make sure we can only pick reactants
      let m = xrScene.moleculeMg.findMolecule(pickedMesh.uniqueId);
      if (m) {
        xrScene.pickedMesh = xrScene.moleculeMg.cloneMesh(m); //clone the master mesh
        xrScene.pickedMesh.setParent(parentMesh, true); //set under parent controller's mesh
        //GLOBAL.print("picked mesh: " + xrScene.pickedMesh);
        xrScene.moleculeMg.currSelected = m;
        //GLOBAL.print("currently picked: " + m.name);
      }
    };

    const releaseAction = () => {
      xrScene.pickedMesh?.setParent(null);
      //GLOBAL.print("destroying this mesh: " + xrScene.pickedMesh);
      xrScene.pickedMesh?.dispose();
      xrScene.pickedMesh = null;
      xrScene.moleculeMg.currSelected = null;
    };

    if (GLOBAL.DEBUG_MODE) {
      //Mouse Picking
      var parentMesh = new AbstractMesh("MousePicking");
      xrScene.canvas.addEventListener("pointermove", function (event) {
        var pickResult = xrScene.scene.pick(
          xrScene.scene.pointerX,
          xrScene.scene.pointerY
        );
        if (pickResult !== null && pickResult.pickedPoint !== null) {
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
          //GLOBAL.print("Picking: " + pickResult.pickedMesh.parent);
          if (pickResult.pickedMesh.name.indexOf("Molecule") !== -1 && pickResult.pickedMesh.name.indexOf("clone") === -1) {
            //Disabling Camera
            xrScene.sceneCam.camera.detachControl();
            pickingAction(pickResult.pickedMesh, parentMesh);
          }
        }
      });

      xrScene.canvas.addEventListener("pointerup", function (event) {
        //Enabling Camera
        xrScene.sceneCam.camera.attachControl();

        //Ungrab mesh
        //GLOBAL.print("Mouse button released!");
        releaseAction();
      });
    }

    //Controller Picking
    xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((motionController) => {
        const trigger = motionController.getComponentOfType("trigger");
        trigger.onButtonStateChangedObservable.add((state) => {
          if (trigger.changes.pressed) {
            if (trigger.pressed) {

              if (xrScene.pickedMesh != null)
                // make sure only one item is selected at a time
                return;

              let pickMesh: AbstractMesh;
              if (
                (pickMesh = xr.pointerSelection.getMeshUnderPointer(
                  controller.uniqueId
                ))
              ) {
                GLOBAL.print("mesh under controllerx pointer: " + pickMesh);
                // only allow picking if its a molecule
                if (pickMesh.name.indexOf("Molecule") !== -1 && pickMesh.name.indexOf("clone") === -1) {
                  const distance = Vector3.Distance(
                    motionController.rootMesh.getAbsolutePosition(),
                    pickMesh.getAbsolutePosition()
                  );
                  if (distance < 1) {
                    GLOBAL.print(
                      "motionController.rootMesh " + motionController.rootMesh
                    );
                    
                    console.log("xrScene.locomotion " + xrScene.locomotion)
                    console.log("xrScene.locomotion.tp " + xrScene.locomotion?.teleportation)
                    xrScene.locomotion?.disableTeleport()
                    pickingAction(pickMesh, motionController.rootMesh);
                  }
                }
              }
            } else {
              releaseAction();
              
              xrScene.locomotion?.enableTeleport()
            }
          }
        });
      });
    });
  }

  static OnCollision(xrScene: XRScene) {
    //reaction zone trigger update
    if (!xrScene.pickedMesh) return;
    if (
      xrScene.pickedMesh.intersectsMesh(xrScene.reactionZone.mesh, false, true)
    ) {
      xrScene.reactionPanel.DeleteContainText("RESULT");
      xrScene.reactionPanel.ClearMolecules();

      // reaction trigger logic
      GLOBAL.print("Meshes intersecting!");
      xrScene.reactionZone.particleEvent.start();
      xrScene.moleculeMg.addMoleculeToList(xrScene.moleculeMg.currSelected);
      xrScene.moleculeMg.currSelected = null;
      xrScene.pickedMesh.dispose();
      xrScene.pickedMesh = null;
    }
  }
}
