import Dude from "./Dude.js";

let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};
let tank;
let tir = [];

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    tank = scene.getMeshByName("heroTank");
    setInterval(createBullets,1000); 
    engine.runRenderLoop(() => {
        let deltaTime = engine.getDeltaTime(); // remind you something ?

        tank.move();

        for(let j=0;j<tir.length;j++){
            tir[j].move();
        }

        let heroDude = scene.getMeshByName("heroDude");
        if(heroDude)
            heroDude.Dude.move(scene);

        if(scene.dudes) {
            for(var i = 0 ; i < scene.dudes.length ; i++) {
                scene.dudes[i].Dude.move(scene);
            }
        }    

        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);
    let sky = createSkybox(scene);
    
    ///texture des objets
    var objectMaterial = new BABYLON.StandardMaterial("groundTexture", scene);
    objectMaterial.diffuseTexture = new BABYLON.Texture("images/pierre.jpg", scene);

    ///création des blocs
    var box = BABYLON.Mesh.CreateBox("box1", 3, scene);
    box.scaling.x = 5;
    box.scaling.y = 5;
    box.scaling.z = 5;
    box.position = new BABYLON.Vector3(500,((3/2)*box.scaling.y),500);
    box.rotation.y = (Math.PI*45)/180;
    box.material = objectMaterial;

    var box2 = box.clone("box2");
    box2.scaling.x = 3;
    box2.scaling.y = 5;
    box2.scaling.z = 3;
    box2.position = new BABYLON.Vector3(5,((3/2)*box2.scaling.y),-500);
    box2.material = objectMaterial;

    var box3 = box.clone("box3");
    box3.scaling.x = 2;
    box3.scaling.y = 4;
    box3.scaling.z = 2;
    box3.position = new BABYLON.Vector3(-500,((3/2)*box3.scaling.y),-5);
    box3.material = objectMaterial;

    var box4 = box.clone("box4");
    box4.scaling.y = 5;
    box4.position = new BABYLON.Vector3(-5,((3/2)*box4.scaling.y),1500);
    box4.material = objectMaterial;

    var box5 = box.clone("box5");
    box5.scaling.x = 2;
    box5.scaling.y = 2;
    box5.scaling.z = 2;
    box5.position = new BABYLON.Vector3(-15,((3/2)*box5.scaling.y),25);
    box5.material = objectMaterial;

    ///creation des cylindres
    var cylinder = BABYLON.Mesh.CreateCylinder("cyl1", 20, 5, 5, 25, 4, scene);
    cylinder.position.x = 40;
    cylinder.position.y = 20/2;
    cylinder.material = objectMaterial;

    var cylinder2 = BABYLON.Mesh.CreateCylinder("cyl2", 20, 5, 5, 30, 4, scene);
    cylinder2.position.y = 20/2;
    cylinder2.position.z = 90;
    cylinder2.material = objectMaterial;

    var cylinder3 = BABYLON.Mesh.CreateCylinder("cyl3", 20, 5, 5, 20, 4, scene);
    cylinder3.position.x = -100;
    cylinder3.position.y = 20/2;
    cylinder3.position.z = -120;
    cylinder3.scaling.x = 5;
    cylinder3.scaling.z = 5;
    cylinder3.material = objectMaterial;

   tank = createTank(scene);
   let bullet = createBullets(scene);

    // second parameter is the target to follow
    let followCamera = createFollowCamera(scene, tank);
    scene.activeCamera = followCamera;

    createLights(scene);

    createHeroDude(scene);
 
   return scene;
}

function createBullets(scene) {
    let bullet = BABYLON.Mesh.CreateSphere("bullet", 1, 1, scene);
	bullet.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
	bullet.material = new BABYLON.StandardMaterial("bMat", scene);
	bullet.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
	bullet.position.x = tank.position.x;
    bullet.position.y = tank.position.y+1;
    bullet.position.z = tank.position.z;

    bullet.frontVector = tank.frontVector;

    tir[tir.length] = bullet;

    bullet.move = () =>{
        bullet.moveWithCollisions(bullet.frontVector.multiplyByFloats(2,2,2));
    }

}

function createGround(scene) {
    const groundOptions = { width:2000, height:2000, subdivisions:20, minHeight:0, maxHeight:20, onReady: onGroundCreated};
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', groundOptions, scene); 

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundTexture", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg", scene);

        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;
    }
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(0, -1, 0), scene);
    let light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 20, 0), scene);
    light0.intensity = 0.5;
    light1.intensity = 0.5;
}

function createSkybox(scene) {
    // Création d'une material
       var skyMaterial = new BABYLON.StandardMaterial("skyboxMaterial", scene);
       skyMaterial.backFaceCulling = false;
       skyMaterial.reflectionTexture = new BABYLON.CubeTexture("images/skybox/skybox", scene);
       skyMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  
       // Création d'un cube avec la material adaptée
       var skybox = BABYLON.Mesh.CreateBox("skybox", 2000, scene);
       skybox.material = skyMaterial;
  }

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true; 
    // avoid flying with the camera
    camera.applyGravity = true;

    // Add extra keys for camera movements
    // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene, target) {
    let camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);

    camera.radius = 40; // how far from the object to follow
	camera.heightOffset = 14; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

let zMovement = 5;
function createTank(scene) {
    tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {height:4, depth:3, width:3}, scene);
    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    ///tankMaterial.diffuseTexture = new BABYLON.Texture("images/cube/cube_nz.png", scene);
    tank.material = tankMaterial;

    // By default the box/tank is in 0, 0, 0, let's change that...
    tank.position.y = 0.6;
    tank.speed = 1;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);

    tank.move = () => {
                //tank.position.z += -1; // speed should be in unit/s, and depends on
                                 // deltaTime !

        // if we want to move while taking into account collision detections
        // collision uses by default "ellipsoids"

        let yMovement = 0;
       
        if (tank.position.y > 2) {
            zMovement = 0;
            yMovement = -2;
        } 
        //tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, zMovement));

        if(inputStates.up) {
            //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, 1*tank.speed));
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
        }    
        if(inputStates.down) {
            //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, -1*tank.speed));
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-tank.speed, -tank.speed, -tank.speed));

        }    
        if(inputStates.left) {
            //tank.moveWithCollisions(new BABYLON.Vector3(-1*tank.speed, 0, 0));
            tank.rotation.y -= 0.02;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }    
        if(inputStates.right) {
            //tank.moveWithCollisions(new BABYLON.Vector3(1*tank.speed, 0, 0));
            tank.rotation.y += 0.02;
            tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
        }

    }

    return tank;
}

function createHeroDude(scene) {
   // load the Dude 3D animated model
    // name, folder, skeleton name 
    BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "Dude.babylon", scene,  (newMeshes, particleSystems, skeletons) => {
        let heroDude = newMeshes[0];
        heroDude.position = new BABYLON.Vector3(0, 0, 5);  // The original dude
        // make it smaller 
        heroDude.scaling = new BABYLON.Vector3(0.2  , 0.2, 0.2);
        //heroDude.speed = 0.1;

        // give it a name so that we can query the scene to get it by name
        heroDude.name = "heroDude";

        // there might be more than one skeleton in an imported animated model. Try console.log(skeletons.length)
        // here we've got only 1. 
        // animation parameters are skeleton, starting frame, ending frame,  a boolean that indicate if we're gonna 
        // loop the animation, speed, 
        let a = scene.beginAnimation(skeletons[0], 0, 120, true, 1);

        let hero = new Dude(heroDude, 0.1);

        // make clones
        scene.dudes = [];
        for(let i = 0; i < 5; i++) {
            scene.dudes[i] = doClone(heroDude, skeletons, i);
            scene.beginAnimation(scene.dudes[i].skeleton, 0, 120, true, 1);

            // Create instance with move method etc.
            var temp = new Dude(scene.dudes[i], 0.3);
            // remember that the instances are attached to the meshes
            // and the meshes have a property "Dude" that IS the instance
            // see render loop then....
        }

    });
}


function doClone(originalMesh, skeletons, id) {
    let myClone;
    let xrand = Math.floor(Math.random()*500 - 250);
    let zrand = Math.floor(Math.random()*500 - 250);

    myClone = originalMesh.clone("clone_" + id);
    myClone.position = new BABYLON.Vector3(xrand, 0, zrand);

    if(!skeletons) return myClone;

    // The mesh has at least one skeleton
    if(!originalMesh.getChildren()) {
        myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
        return myClone;
    } else {
        if(skeletons.length === 1) {
            // the skeleton controls/animates all children, like in the Dude model
            let clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
            myClone.skeleton = clonedSkeleton;
            let nbChildren = myClone.getChildren().length;

            for(let i = 0; i < nbChildren;  i++) {
                myClone.getChildren()[i].skeleton = clonedSkeleton
            }
            return myClone;
        } else if(skeletons.length === originalMesh.getChildren().length) {
            // each child has its own skeleton
            for(let i = 0; i < myClone.getChildren().length;  i++) {
                myClone.getChildren()[i].skeleton() = skeletons[i].clone("clone_" + id + "_skeleton_" + i);
            }
            return myClone;
        }
    }

    return myClone;
}

window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if(element) {
            // lets create a custom attribute
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    // key listeners for the tank
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = true;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = true;
        }  else if (event.key === " ") {
           inputStates.space = true;
        }
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = false;
        }  else if (event.key === " ") {
           inputStates.space = false;
        }
    }, false);
}

