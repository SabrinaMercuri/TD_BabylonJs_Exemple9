export default class Dude {
    constructor(dudeMesh, speed) {
        this.dudeMesh = dudeMesh;

        if (speed)
            this.speed = speed;
        else
            this.speed = 1;

        // in case, attach the instance to the mesh itself, in case we need to retrieve
        // it after a scene.getMeshByName that would return the Mesh
        // SEE IN RENDER LOOP !
        dudeMesh.Dude = this;
    }

    move(scene) {
        // follow the tank
        let tank = scene.getMeshByName("heroTank");
        // let's compute the direction vector that goes from Dude to the tank
        let direction = tank.position.subtract(this.dudeMesh.position);
        let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
        //console.log(distance);

        let dir = direction.normalize();
        // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
        // make a drawing in the X/Z plan to uderstand....
        let alpha = Math.atan2(-dir.x, -dir.z);
        this.dudeMesh.rotation.y = alpha;

        var frameRate = 20;

        var yRot = new BABYLON.Animation("yRot", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        var keyFramesR = [];

        keyFramesR.push({
            frame: 0,
            value: 0
        });

        keyFramesR.push({
            frame: 50,
            value: 4 * Math.PI
        });

        keyFramesR.push({
            frame: 100,
            value: 8 * Math.PI
        });

        yRot.setKeys(keyFramesR);

        // Create the animation group
        var animationGroup = new BABYLON.AnimationGroup("my group");
        animationGroup.addTargetedAnimation(yRot, this.dudeMesh);
        animationGroup.normalize(0, 100);


        // let make the Dude move towards the tank
        if (distance > 30) {
            //a.restart();  
            ///animationGroup.play(true);
            animationGroup.pause();
            alpha = Math.atan2(-dir.x, -dir.z);
            this.dudeMesh.rotation.y = alpha;
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        else {
            //a.pause();
            ///animationGroup.pause()
            animationGroup.play(true);
        }
    }

    move2(scene) {
        // follow the tank
        let tank = scene.getMeshByName("heroTank");
        // let's compute the direction vector that goes from Dude to the tank
        let direction = tank.position.subtract(this.dudeMesh.position);
        let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
        //console.log(distance);

        let dir = direction.normalize();
        // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
        // make a drawing in the X/Z plan to uderstand....
        let alpha = Math.atan2(-dir.x, -dir.z);
        this.dudeMesh.rotation.y = alpha;

        // let make the Dude move towards the tank
        if (distance > 30) {
            //a.restart();   
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        else {
            //a.pause();
        }
    }
}