import { AbstractMesh, Vector3, WebXRDefaultExperience } from "babylonjs";
import { XRScene } from "../Scene/XRScene";
import { GLOBAL } from "../Global";

export class Collision {
  static OnPicking(xr: WebXRDefaultExperience, xrScene: XRScene) {
    const pickingAction = (
      pickedMesh: AbstractMesh,
      parentMesh: AbstractMesh
    ) => {
      // make sure we can only pick reactants
      let m = xrScene.moleculeMg.findJoinReactants(pickedMesh.uniqueId);
      if (m) {
        xrScene.pickedMesh = xrScene.moleculeMg.clone(m); //clone the master mesh
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
          if (pickResult.pickedMesh.name.indexOf("Molecule") !== -1) {
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
              if (pickMesh.name.indexOf("Molecule") !== -1) {
                const distance = Vector3.Distance(
                  motionController.rootMesh.getAbsolutePosition(),
                  pickMesh.getAbsolutePosition()
                );
                if (distance < 1) {
                  GLOBAL.print(
                    "motionController.rootMesh " + motionController.rootMesh
                  );
                  pickingAction(pickMesh, motionController.rootMesh);
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

  static JoinMolecules(xrScene: XRScene) {
    //reaction zone trigger update
    if (!xrScene.pickedMesh) return;
    if (xrScene.pickedMesh.intersectsMesh(xrScene.joinReactionZone.mesh, false, true)) {
      // reaction trigger logic
      GLOBAL.print("Meshes intersecting!");
      xrScene.moleculeMg.addJoinReactionToList(xrScene.moleculeMg.currSelected);
      xrScene.moleculeMg.currSelected = null;
      xrScene.pickedMesh.dispose();
      xrScene.pickedMesh = null;
    }
  }

  static BreakMolecules(xrScene: XRScene) {
    //reaction zone trigger update
    if (!xrScene.pickedMesh) return;
    if (xrScene.pickedMesh.intersectsMesh(xrScene.breakReactionZone.mesh, false, true)) {
      // reaction trigger logic
      GLOBAL.print("Meshes intersecting!");
      xrScene.moleculeMg.addJoinReactionToList(xrScene.moleculeMg.currSelected);
      xrScene.moleculeMg.currSelected = null;
      xrScene.pickedMesh.dispose();
      xrScene.pickedMesh = null;
    }
  }
}
